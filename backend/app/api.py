import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool

from app.config import MAX_REQUEST_BYTES, MODEL_PATH
from app.eml import EmlParseError, extract_subject_and_body
from app.ml_inference import Classification, classify_email, load_model
from app.schemas import ClassifyRequest, ClassifyResponse, Prediction, Probabilities

logger = logging.getLogger(__name__)

MODEL_NAME = "tfidf_logistic_regression_baseline"
DISCLAIMER = (
    "This is a binary text-classification result, not a verified forensic verdict."
)


def to_response(result: Classification) -> ClassifyResponse:
    return ClassifyResponse(
        model=MODEL_NAME,
        prediction=Prediction(label=result.label, name=result.name),
        probabilities=Probabilities(
            benign=result.benign,
            phishing_or_spam=result.phishing_or_spam,
        ),
        disclaimer=DISCLAIMER,
    )


def create_app(model_path: Path = MODEL_PATH) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        app.state.classifier = load_model(model_path)
        yield

    app = FastAPI(title="MailSleuth AI", lifespan=lifespan)

    @app.middleware("http")
    async def limit_request_size(request: Request, call_next):
        content_length = request.headers.get("content-length", "")
        if content_length.isdigit() and int(content_length) > MAX_REQUEST_BYTES:
            return JSONResponse(status_code=413, content={"detail": "Request body too large."})
        return await call_next(request)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = [
            {"loc": list(err["loc"]), "msg": err["msg"], "type": err["type"]}
            for err in exc.errors()
        ]
        return JSONResponse(status_code=422, content={"detail": errors})

    def run_classification(request: Request, subject: str, body: str) -> ClassifyResponse:
        try:
            result = classify_email(request.app.state.classifier, subject, body)
        except Exception as exc:
            logger.error("ML classification failed: %s", type(exc).__name__)
            raise HTTPException(
                status_code=500, detail="Classification failed. Please try again later."
            ) from None
        return to_response(result)

    @app.post("/api/v1/ml/classify", response_model=ClassifyResponse)
    def classify(payload: ClassifyRequest, request: Request) -> ClassifyResponse:
        return run_classification(request, payload.subject, payload.body)

    @app.post("/api/v1/ml/classify-eml", response_model=ClassifyResponse)
    async def classify_eml(request: Request) -> ClassifyResponse:
        raw = await request.body()
        if len(raw) > MAX_REQUEST_BYTES:
            raise HTTPException(status_code=413, detail="Request body too large.")
        try:
            subject, body = extract_subject_and_body(raw)
            payload = ClassifyRequest(subject=subject, body=body)
        except EmlParseError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from None
        except ValidationError:
            raise HTTPException(
                status_code=422, detail="Email subject or body is empty or too long."
            ) from None
        return await run_in_threadpool(run_classification, request, payload.subject, payload.body)

    return app
