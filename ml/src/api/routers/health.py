"""Liveness and readiness probes."""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Liveness probe")
def health() -> dict[str, str]:
    """Return 200 as soon as the process is up."""
    return {"status": "ok"}


@router.get("/ready", summary="Readiness probe")
def ready() -> dict[str, str]:
    """Return 200 when the service can serve traffic.

    TODO: return 503 until the default model has been loaded.
    """
    return {"status": "ready"}
