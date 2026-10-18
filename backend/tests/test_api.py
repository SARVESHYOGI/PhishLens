import math

import pytest
from fastapi.testclient import TestClient
from support import FakeClassifier, RecordingModel, make_eml

from app.api import create_app
from app.config import MAX_REQUEST_BYTES
from app.providers.base import InferenceError, ModelLoadError
from app.providers.baseline import BaselineClassifier

EML_CONTENT_TYPE = "message/rfc822"


def test_classify_endpoint_returns_valid_prediction(client):
    response = client.post(
        "/api/v1/ml/classify",
        json={
            "subject": "Urgent account verification",
            "body": "Please verify your account using this link.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["model"] == "tfidf_logistic_regression_baseline"
    assert data["prediction"]["label"] in (0, 1)
    assert data["prediction"]["name"] == (
        "phishing_or_spam" if data["prediction"]["label"] else "benign"
    )
    probs = [data["probabilities"]["benign"], data["probabilities"]["phishing_or_spam"]]
    assert all(math.isfinite(p) and 0.0 <= p <= 1.0 for p in probs)
    assert math.isclose(sum(probs), 1.0, abs_tol=1e-5)
    assert probs[data["prediction"]["label"]] == max(probs)
    assert data["disclaimer"].startswith("This is a binary text-classification result")


def test_missing_subject_is_accepted(client):
    response = client.post("/api/v1/ml/classify", json={"body": "hello"})
    assert response.status_code == 200


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"subject": "x"},
        {"body": ""},
        {"body": "   \n\t  "},
        {"body": 123},
        {"body": "ok", "subject": ["not", "a", "string"]},
        {"body": "ok", "unexpected": "field"},
        {"body": "x" * 50_001},
        {"body": "ok", "subject": "s" * 301},
    ],
)
def test_invalid_requests_return_422_without_echoing_input(client, payload):
    response = client.post("/api/v1/ml/classify", json=payload)
    assert response.status_code == 422
    assert "input" not in response.json()["detail"][0]


def test_oversized_request_returns_413(client):
    response = client.post(
        "/api/v1/ml/classify",
        content=b"{}",
        headers={"content-type": "application/json", "content-length": str(300 * 1024)},
    )
    assert response.status_code == 413


def test_inference_failure_returns_generic_500_without_prediction(client, monkeypatch):
    secret = "confidential-email-text"
    fake = FakeClassifier(error=InferenceError(secret))
    monkeypatch.setattr(client.app.state, "classifier", fake)
    response = client.post("/api/v1/ml/classify", json={"body": "hello"})
    assert response.status_code == 500
    assert "prediction" not in response.json()
    assert secret not in response.text


def test_unexpected_error_returns_safe_500():
    secret = "internal-detail"
    app = create_app()
    with TestClient(app, raise_server_exceptions=False) as test_client:
        test_client.app.state.classifier = FakeClassifier(error=RuntimeError(secret))
        response = test_client.post("/api/v1/ml/classify", json={"body": "hello"})
    assert response.status_code == 500
    assert secret not in response.text


def test_eml_plain_text_is_preprocessed_for_training(client, monkeypatch):
    model = RecordingModel([0, 1], [0.2, 0.8])
    monkeypatch.setattr(client.app.state, "classifier", BaselineClassifier(model))
    raw = make_eml(subject="Urgent verification", body="Click the link now.")
    response = client.post(
        "/api/v1/ml/classify-eml",
        content=raw,
        headers={"content-type": EML_CONTENT_TYPE},
    )
    assert response.status_code == 200
    assert model.seen_texts == ["Subject: Urgent verification\nBody: Click the link now."]
    assert response.json()["prediction"]["label"] == 1


def test_eml_attachment_content_is_not_sent_to_model(client, monkeypatch):
    model = RecordingModel([0, 1], [0.6, 0.4])
    monkeypatch.setattr(client.app.state, "classifier", BaselineClassifier(model))
    raw = make_eml(subject="Invoice", body="See attached.", attachment=b"MZ\x90\x00 payload")
    response = client.post(
        "/api/v1/ml/classify-eml",
        content=raw,
        headers={"content-type": EML_CONTENT_TYPE},
    )
    assert response.status_code == 200
    assert model.seen_texts == ["Subject: Invoice\nBody: See attached."]


def test_eml_missing_subject_is_empty(client, monkeypatch):
    model = RecordingModel([0, 1], [0.6, 0.4])
    monkeypatch.setattr(client.app.state, "classifier", BaselineClassifier(model))
    raw = make_eml(body="hello there")
    response = client.post(
        "/api/v1/ml/classify-eml",
        content=raw,
        headers={"content-type": EML_CONTENT_TYPE},
    )
    assert response.status_code == 200
    assert model.seen_texts == ["Subject: \nBody: hello there"]


def test_eml_html_only_returns_422(client):
    raw = make_eml(subject="Hi", html="<p>Click <a href='https://example.com'>here</a></p>")
    response = client.post(
        "/api/v1/ml/classify-eml",
        content=raw,
        headers={"content-type": EML_CONTENT_TYPE},
    )
    assert response.status_code == 422
    assert "plain-text" in response.json()["detail"]


def test_eml_empty_body_returns_422(client):
    raw = make_eml(subject="Empty", body="   \n")
    response = client.post(
        "/api/v1/ml/classify-eml",
        content=raw,
        headers={"content-type": EML_CONTENT_TYPE},
    )
    assert response.status_code == 422


def test_eml_oversized_request_returns_413(client):
    raw = b"x" * (MAX_REQUEST_BYTES + 1)
    response = client.post(
        "/api/v1/ml/classify-eml",
        content=raw,
        headers={"content-type": EML_CONTENT_TYPE},
    )
    assert response.status_code == 413


def test_eml_endpoint_real_model_returns_valid_probabilities(client):
    raw = make_eml(
        subject="Urgent account verification",
        body="Please verify your account using this link.",
    )
    response = client.post(
        "/api/v1/ml/classify-eml",
        content=raw,
        headers={"content-type": EML_CONTENT_TYPE},
    )
    assert response.status_code == 200
    probs = [
        response.json()["probabilities"]["benign"],
        response.json()["probabilities"]["phishing_or_spam"],
    ]
    assert all(0.0 <= p <= 1.0 for p in probs)
    assert math.isclose(sum(probs), 1.0, abs_tol=1e-5)


def test_startup_fails_when_artifact_missing(tmp_path):
    app = create_app(model_path=tmp_path / "missing.pkl")
    with pytest.raises(ModelLoadError):
        with TestClient(app):
            pass
