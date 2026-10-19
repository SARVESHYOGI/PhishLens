"""Model providers and their registry.

A *provider* wraps one model (a scikit-learn pickle, a Hugging Face
checkpoint, ...) behind the :class:`TextClassifier` protocol. The registry
maps a stable name such as ``"baseline"`` to a factory that builds the
provider.
"""

from inference.base import Classification, TextClassifier
from inference.registry import load_classifier, register

__all__ = [
    "Classification",
    "TextClassifier",
    "load_classifier",
    "register",
]
