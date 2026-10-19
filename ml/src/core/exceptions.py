"""Domain exceptions.

These are raised by the inference and training layers and translated into
HTTP responses by ``api.errors``.
"""


class PhishLensError(RuntimeError):
    """Base class for every error raised by the service."""


class ModelLoadError(PhishLensError):
    """A model artifact is missing, corrupted, or of the wrong type."""


class InferenceError(PhishLensError):
    """A model returned a result that cannot be served."""


class ProviderUnavailable(PhishLensError):
    """An optional provider is not installed, configured, or reachable."""
