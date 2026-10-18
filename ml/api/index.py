import logging
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI, HTTPException  # noqa: E402

from serving.base import (  # noqa: E402
    Classification,
    InferenceError,
    ModelLoadError,
    ProviderUnavailable,
)
from serving.config import AVAILABLE_CLASSIFIERS  # noqa: E402
from serving.contract import (  # noqa: E402
    ClassifyRequest,
    ClassifyResponse,
    ModelsResponse,
    Prediction,
    Probabilities,
)
from serving.registry import load_classifier  # noqa: E402

logger = logging.getLogger(__name__)

DISCLAIMER = (
    "This is a binary text-classification result, not a verified forensic verdict."
)

app = FastAPI(title="MailSleuth Model Service")

_cache = {}


def get_classifier(name):
    if name not in _cache:
        _cache[name] = load_classifier(name)
    return _cache[name]


def to_response(model, result):
    return ClassifyResponse(
        model=model,
        prediction=Prediction(label=result.label, name=result.name),
        probabilities=Probabilities(
            benign=result.benign,
            phishing_or_spam=result.phishing_or_spam,
        ),
        disclaimer=DISCLAIMER,
    )


@app.get("/health")
def health_route():
    return {"status": "ok"}


@app.get("/v1/models", response_model=ModelsResponse)
def models_route():
    return ModelsResponse(available=list(AVAILABLE_CLASSIFIERS))


@app.post("/v1/classify", response_model=ClassifyResponse)
def classify_route(payload: ClassifyRequest):
    try:
        classifier = get_classifier(payload.model)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from None
    except (ModelLoadError, ProviderUnavailable) as exc:
        logger.error("Provider unavailable: %s", type(exc).__name__)
        raise HTTPException(status_code=503, detail=str(exc)) from None

    try:
        result = classifier.predict(payload.subject, payload.body)
    except (ModelLoadError, InferenceError) as exc:
        logger.error("Inference failed: %s", type(exc).__name__)
        raise HTTPException(status_code=500, detail="Classification failed.") from None

    return to_response(classifier.name, result)
