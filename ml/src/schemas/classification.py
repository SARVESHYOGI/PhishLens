"""Request and response contracts for the classification endpoints."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from config import settings


class ClassifyRequest(BaseModel):
    """A single email to classify."""

    model_config = ConfigDict(extra="forbid")

    model: str = Field(default=settings.default_model, max_length=64)
    subject: str = Field(default="", max_length=settings.max_subject_chars)
    body: str = Field(min_length=1, max_length=settings.max_body_chars)

    @field_validator("subject", mode="before")
    @classmethod
    def missing_subject_is_empty(cls, value: Any) -> Any:
        return "" if value is None else value

    @field_validator("subject", "body")
    @classmethod
    def strip_whitespace(cls, value: str) -> str:
        return value.strip()

    @field_validator("body")
    @classmethod
    def body_not_blank(cls, value: str) -> str:
        if not value:
            raise ValueError("body must contain non-whitespace text")
        return value


class Prediction(BaseModel):
    """Winning label as an index and a human-readable name."""

    label: int
    name: str


class Probabilities(BaseModel):
    """Per-class probabilities that sum to 1.0."""

    benign: float
    phishing_or_spam: float


class ClassifyResponse(BaseModel):
    """Result of classifying one email."""

    model: str
    prediction: Prediction
    probabilities: Probabilities
    disclaimer: str


class ModelInfo(BaseModel):
    """One entry in the list of servable models."""

    name: str
    default: bool


class ModelsResponse(BaseModel):
    """Response body for the model listing endpoint."""

    available: list[ModelInfo]
