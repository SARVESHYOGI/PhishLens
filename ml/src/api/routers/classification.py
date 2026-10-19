"""Classification endpoints.

The routes and contracts are wired end to end. To return real predictions,
implement a provider under ``src/inference`` and register it in the
registry (see ``src/inference/registry.py``). Until then,
``POST /v1/classify`` answers 503.
"""

from fastapi import APIRouter, HTTPException

from api.dependencies import get_classifier
from config import settings
from schemas.classification import (
    ClassifyRequest,
    ClassifyResponse,
    ModelInfo,
    ModelsResponse,
    Prediction,
    Probabilities,
)

router = APIRouter(prefix="/v1", tags=["classification"])

DISCLAIMER = (
    "This is a binary text-classification result, not a verified forensic verdict."
)


@router.get("/models", response_model=ModelsResponse, summary="List servable models")
def list_models() -> ModelsResponse:
    """Return every model name the service knows about."""
    return ModelsResponse(
        available=[
            ModelInfo(name=name, default=name == settings.default_model)
            for name in settings.available_models
        ]
    )


@router.post("/classify", response_model=ClassifyResponse, summary="Classify an email")
def classify(payload: ClassifyRequest) -> ClassifyResponse:
    """Classify a single email subject and body."""
    try:
        classifier = get_classifier(payload.model)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from None

    result = classifier.predict(payload.subject, payload.body)
    return ClassifyResponse(
        model=classifier.name,
        prediction=Prediction(label=result.label, name=result.name),
        probabilities=Probabilities(
            benign=result.benign,
            phishing_or_spam=result.phishing_or_spam,
        ),
        disclaimer=DISCLAIMER,
    )
