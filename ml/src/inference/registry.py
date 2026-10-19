"""Resolve a model name to a ready-to-use classifier.

Register providers here as they are implemented, for example::

    from inference.baseline import BaselineClassifier

    register(BASELINE, BaselineClassifier.from_artifact)

Until a provider is registered, ``load_classifier`` raises
``ProviderUnavailable`` so the API can answer with 503 instead of failing
at import time.
"""

from collections.abc import Callable

from config import settings
from core.exceptions import ProviderUnavailable
from inference.base import TextClassifier

Provider = Callable[[], TextClassifier]

_PROVIDERS: dict[str, Provider] = {}


def register(name: str, factory: Provider) -> None:
    """Register a provider factory under ``name`` (idempotent per name)."""
    _PROVIDERS[name] = factory


def load_classifier(name: str = settings.default_model) -> TextClassifier:
    """Return a classifier for ``name``.

    Raises:
        ValueError: ``name`` is not a known model.
        ProviderUnavailable: the model is known but its provider is not
            implemented or installed yet.
    """
    if name not in settings.available_models:
        raise ValueError(
            f"Unknown model '{name}'. Available: {', '.join(settings.available_models)}."
        )
    factory = _PROVIDERS.get(name)
    if factory is None:
        raise ProviderUnavailable(f"The '{name}' provider is not implemented yet.")
    return factory()
