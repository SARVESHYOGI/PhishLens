from dataclasses import dataclass
from typing import Protocol

LABEL_NAMES = {0: "benign", 1: "phishing_or_spam"}


class ModelLoadError(RuntimeError):
    pass


class InferenceError(RuntimeError):
    pass


@dataclass(frozen=True)
class Classification:
    label: int
    name: str
    benign: float
    phishing_or_spam: float


class TextClassifier(Protocol):
    name: str

    def predict(self, subject: str, body: str) -> Classification: ...
