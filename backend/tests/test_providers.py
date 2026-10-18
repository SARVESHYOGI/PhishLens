import joblib
import pytest
from support import RecordingModel

from app.config import MODEL_PATH
from app.preprocess import build_email_text
from app.providers.base import InferenceError, ModelLoadError
from app.providers.baseline import BaselineClassifier, load_model
from app.providers.registry import load_classifier


class TwoClassModel:
    classes_ = [0, 2]

    def predict_proba(self, texts):
        return np.array([[0.5, 0.5] for _ in texts])


def test_model_loads_from_project_ml_directory():
    assert MODEL_PATH.is_file()
    assert MODEL_PATH.parent.name == "models" and MODEL_PATH.parent.parent.name == "ml"
    model = load_model(MODEL_PATH)
    assert sorted(int(c) for c in model.classes_) == [0, 1]


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


def test_unexpected_class_labels_raise_inference_error():
    model = RecordingModel([0, 2], [0.5, 0.5])
    with pytest.raises(InferenceError):
        BaselineClassifier(model).predict("s", "b")


def test_registry_loads_baseline_provider():
    classifier = load_classifier()
    assert classifier.name == "tfidf_logistic_regression_baseline"


def test_registry_rejects_unknown_provider():
    with pytest.raises(ValueError, match="Unknown classifier"):
        load_classifier("does-not-exist")


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
