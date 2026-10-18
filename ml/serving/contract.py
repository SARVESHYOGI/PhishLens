from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from serving.config import MAX_BODY_CHARS, MAX_SUBJECT_CHARS


class ClassifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    subject: str = Field(default="", max_length=MAX_SUBJECT_CHARS)
    body: str = Field(min_length=1, max_length=MAX_BODY_CHARS)

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
    label: int
    name: str


class Probabilities(BaseModel):
    benign: float
    phishing_or_spam: float


class ClassifyResponse(BaseModel):
    model: str
    prediction: Prediction
    probabilities: Probabilities
    disclaimer: str


class ModelsResponse(BaseModel):
    available: list[str]
