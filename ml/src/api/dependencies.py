"""Shared FastAPI dependencies."""

from functools import lru_cache

from inference.base import TextClassifier
from inference.registry import load_classifier


@lru_cache(maxsize=None)
def get_classifier(name: str) -> TextClassifier:
    """Return a process-wide cached classifier for ``name``.

    Models are expensive to load, so each provider is instantiated at most
    once. Call ``get_classifier.cache_clear()`` in tests to reset it.
    """
    return load_classifier(name)
