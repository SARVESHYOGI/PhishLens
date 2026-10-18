from pathlib import Path

from app.providers.base import TextClassifier
from app.providers.baseline import BaselineClassifier

from app.config import MODEL_PATH

BASELINE = "baseline"
AVAILABLE_CLASSIFIERS = (BASELINE,)


def load_classifier(name: str = BASELINE, model_path: Path = MODEL_PATH) -> TextClassifier:
    if name == BASELINE:
        return BaselineClassifier.from_path(model_path)
    raise ValueError(
        f"Unknown classifier '{name}'. Available: {', '.join(AVAILABLE_CLASSIFIERS)}."
    )
