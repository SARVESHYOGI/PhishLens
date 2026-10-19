"""Translate domain exceptions into HTTP responses."""

import logging

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from core.exceptions import (
    InferenceError,
    ModelLoadError,
    ProviderUnavailable,
)

logger = logging.getLogger(__name__)


def register_error_handlers(app: FastAPI) -> None:
    """Attach handlers so domain errors never leak internals as 500 tracebacks."""

    @app.exception_handler(ProviderUnavailable)
    async def _provider_unavailable(
        _: Request, exc: ProviderUnavailable
    ) -> JSONResponse:
        logger.error("Provider unavailable: %s", type(exc).__name__)
        return JSONResponse(status_code=503, content={"detail": str(exc)})

    @app.exception_handler(ModelLoadError)
    async def _model_load_error(_: Request, exc: ModelLoadError) -> JSONResponse:
        logger.error("Model load failed: %s", type(exc).__name__)
        return JSONResponse(status_code=503, content={"detail": str(exc)})

    @app.exception_handler(InferenceError)
    async def _inference_error(_: Request, __: InferenceError) -> JSONResponse:
        logger.error("Inference failed")
        return JSONResponse(
            status_code=500, content={"detail": "Classification failed."}
        )
