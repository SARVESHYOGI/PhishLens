"""Provider-agnostic inference primitives."""

from dataclasses import dataclass
from typing import Protocol

#: Canonical label names. Label 0 is always the benign class.
LABEL_NAMES = {0: "benign", 1: "phishing_or_spam"}


@dataclass(frozen=True)
class Classification:
    """A single classification result."""

    label: int
    name: str
    benign: float
    phishing_or_spam: float


class TextClassifier(Protocol):
    """The interface every provider implements."""

    name: str

    def predict(self, subject: str, body: str) -> Classification:
        """Classify one email and return its label and probabilities."""
