from pathlib import Path

from serving.baseline import BaselineClassifier
from serving.hf import HuggingFaceClassifier

from serving.base import TextClassifier
from serving.config import MODEL_PATH

BASELINE = "baseline"
HF = "hf"
AVAILABLE_CLASSIFIERS = (BASELINE, HF)


def load_classifier(
    name: str = BASELINE, model_path: Path = MODEL_PATH
) -> TextClassifier:
    if name == BASELINE:
        return BaselineClassifier.from_path(model_path)
    if name == HF:
        return HuggingFaceClassifier()
    raise ValueError(
        f"Unknown classifier '{name}'. Available: {', '.join(AVAILABLE_CLASSIFIERS)}."
    )
