import math
import pickle
from pathlib import Path
from typing import Any

import joblib
from serving.preprocess import build_email_text

from serving.base import (
    LABEL_NAMES,
    Classification,
    InferenceError,
    ModelLoadError,
)
from serving.config import MODEL_PATH

PROBABILITY_SUM_TOLERANCE = 1e-5

_LOAD_ERRORS = (
    OSError,
    ValueError,
    pickle.UnpicklingError,
    EOFError,
    KeyError,
    AttributeError,
    ImportError,
)


def load_model(path: Path) -> Any:
    if not path.is_file():
        raise ModelLoadError(
            f"Model artifact '{path.name}' not found in ml/models/. "
            "Train the baseline model and copy baseline_model.pkl into that directory."
        )
    try:
        model = joblib.load(path)
    except _LOAD_ERRORS as exc:
        raise ModelLoadError(
            f"Could not load model artifact '{path.name}' ({type(exc).__name__}). "
            "The file may be corrupted or built with an incompatible scikit-learn version."
        ) from exc

    if not hasattr(model, "predict_proba") or not hasattr(model, "classes_"):
        raise ModelLoadError(
            f"Artifact '{path.name}' is not a fitted classifier with predict_proba and classes_."
        )
    if sorted(int(c) for c in model.classes_) != [0, 1]:
        raise ModelLoadError(
            f"Artifact '{path.name}' must be a binary classifier with classes 0 and 1."
        )
    return model


def _validate_probabilities(probabilities: list[float]) -> None:
    all_valid = all(math.isfinite(p) and 0.0 <= p <= 1.0 for p in probabilities)
    if not all_valid or abs(sum(probabilities) - 1.0) > PROBABILITY_SUM_TOLERANCE:
        raise InferenceError("Model returned invalid probabilities.")


class BaselineClassifier:
    name = "tfidf_logistic_regression_baseline"

    def __init__(self, model: Any) -> None:
        self._model = model

    @classmethod
    def from_path(cls, path: Path = MODEL_PATH) -> "BaselineClassifier":
        return cls(load_model(path))

    def predict(self, subject: str, body: str) -> Classification:
        text = build_email_text(subject, body)
        row = self._model.predict_proba([text])[0]

        probabilities = {int(c): float(p) for c, p in zip(self._model.classes_, row)}
        if set(probabilities) != {0, 1}:
            raise InferenceError("Model classes do not match the expected binary labels.")
        _validate_probabilities(list(probabilities.values()))

        label = max(probabilities, key=lambda k: probabilities[k])
        return Classification(
            label=label,
            name=LABEL_NAMES[label],
            benign=probabilities[0],
            phishing_or_spam=probabilities[1],
        )
