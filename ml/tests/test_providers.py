import joblib
import pytest

from serving.base import InferenceError, ModelLoadError
from serving.baseline import BaselineClassifier, load_model
from serving.config import AVAILABLE_CLASSIFIERS, MODEL_PATH
from serving.preprocess import build_email_text
from serving.registry import load_classifier


class RecordingModel:
    def __init__(self, classes, row):
        self.classes_ = classes
        self._row = [row]
        self.seen_texts = []

    def predict_proba(self, texts):
        self.seen_texts.extend(texts)
        return self._row


class TwoClassModel:
    classes_ = [0, 2]

    def predict_proba(self, texts):
        return [[0.5, 0.5] for _ in texts]


def test_available_classifiers_lists_both_models():
    assert set(AVAILABLE_CLASSIFIERS) == {"baseline", "hf"}


def test_build_email_text_matches_training_format():
    assert build_email_text("  Hi  ", "\n Body text \n") == "Subject: Hi\nBody: Body text"


def test_predict_uses_training_text_format():
    model = RecordingModel([0, 1], [0.3, 0.7])
    result = BaselineClassifier(model).predict(" Hi ", "\n Body \n")
    assert model.seen_texts == ["Subject: Hi\nBody: Body"]
    assert result.label == 1


def test_predict_treats_empty_subject_as_empty_string():
    model = RecordingModel([0, 1], [0.6, 0.4])
    BaselineClassifier(model).predict("", "hello")
    assert model.seen_texts == ["Subject: \nBody: hello"]


def test_probabilities_are_mapped_by_classes_not_column_order():
    model = RecordingModel([1, 0], [0.9, 0.1])
    result = BaselineClassifier(model).predict("s", "b")
    assert result.phishing_or_spam == pytest.approx(0.9)
    assert result.benign == pytest.approx(0.1)
    assert result.label == 1
    assert result.name == "phishing_or_spam"


def test_invalid_probabilities_raise_inference_error():
    model = RecordingModel([0, 1], [float("nan"), 1.0])
    with pytest.raises(InferenceError):
        BaselineClassifier(model).predict("s", "b")


def test_registry_loads_baseline_provider():
    classifier = load_classifier()
    assert classifier.name == "tfidf_logistic_regression_baseline"


def test_registry_rejects_unknown_provider():
    with pytest.raises(ValueError, match="Unknown classifier"):
        load_classifier("does-not-exist")


def test_real_artifact_loads_and_predicts():
    classifier = load_classifier("baseline")
    result = classifier.predict("Urgent account verification", "Please verify your account.")
    probabilities = [result.benign, result.phishing_or_spam]
    assert all(0.0 <= p <= 1.0 for p in probabilities)
    assert pytest.approx(sum(probabilities), abs=1e-5) == 1.0
    assert result.label in (0, 1)


def test_missing_artifact_raises_clear_error(tmp_path):
    with pytest.raises(ModelLoadError, match="not found"):
        load_model(tmp_path / "missing.pkl")


def test_corrupted_artifact_raises_clear_error(tmp_path):
    bad = tmp_path / "corrupt.pkl"
    bad.write_bytes(b"not a pickle at all")
    with pytest.raises(ModelLoadError, match="Could not load"):
        load_model(bad)


def test_wrong_object_type_raises_clear_error(tmp_path):
    wrong = tmp_path / "wrong.pkl"
    joblib.dump({"not": "a model"}, wrong)
    with pytest.raises(ModelLoadError, match="not a fitted classifier"):
        load_model(wrong)


def test_non_binary_artifact_raises_clear_error(tmp_path):
    wrong = tmp_path / "twoclass.pkl"
    joblib.dump(TwoClassModel(), wrong)
    with pytest.raises(ModelLoadError, match="binary classifier"):
        load_model(wrong)


def test_default_model_path_points_into_ml_models():
    assert MODEL_PATH.parent.name == "models"
    assert MODEL_PATH.parent.parent.name == "ml"
