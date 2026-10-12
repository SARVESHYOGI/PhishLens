import math
from email.message import EmailMessage
from pathlib import Path

import joblib
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.api import create_app
from app.config import MAX_REQUEST_BYTES, MODEL_PATH
from app.eml import EmlParseError, extract_subject_and_body
from app.ml_inference import (
    InferenceError,
    ModelLoadError,
    build_email_text,
    classify_email,
    load_model,
)

EML_CONTENT_TYPE = "message/rfc822"


class RecordingClassifier:
    def __init__(self, classes, row, error=None):
        self.classes_ = np.array(classes)
        self._row = np.array([row])
        self._error = error
        self.seen_texts = []

    def predict_proba(self, texts):
        self.seen_texts.extend(texts)
        if self._error is not None:
            raise self._error
        return self._row


def make_eml(subject=None, body=None, html=None, attachment=None) -> bytes:
    msg = EmailMessage()
    if subject is not None:
        msg["Subject"] = subject
    msg["From"] = "sender@example.com"
    msg["To"] = "user@example.com"
    if html is not None:
        msg.set_content(html, subtype="html")
    else:
        msg.set_content(body if body is not None else "")
    if attachment is not None:
        msg.add_attachment(
            attachment,
            maintype="application",
            subtype="octet-stream",
            filename="payload.exe",
        )
    return msg.as_bytes()


@pytest.fixture(scope="module")
def client():
    with TestClient(create_app()) as test_client:
        yield test_client


def test_model_loads_from_project_ml_directory():
    assert MODEL_PATH.is_file()
    assert MODEL_PATH.parent.name == "models" and MODEL_PATH.parent.parent.name == "ml"
    model = load_model(MODEL_PATH)
    assert sorted(int(c) for c in model.classes_) == [0, 1]


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


def test_build_email_text_matches_training_format():
    assert build_email_text("  Hi  ", "\n Body text \n") == "Subject: Hi\nBody: Body text"


def test_text_passed_to_classifier_uses_training_format(client, monkeypatch):
    fake = RecordingClassifier([0, 1], [0.3, 0.7])
    monkeypatch.setattr(client.app.state, "classifier", fake)
    response = client.post("/api/v1/ml/classify", json={"subject": " S ", "body": " B "})
    assert response.status_code == 200
    assert fake.seen_texts == ["Subject: S\nBody: B"]


def test_missing_subject_is_treated_as_empty(client, monkeypatch):
    fake = RecordingClassifier([0, 1], [0.6, 0.4])
    monkeypatch.setattr(client.app.state, "classifier", fake)
    response = client.post("/api/v1/ml/classify", json={"body": "hello"})
    assert response.status_code == 200
    assert fake.seen_texts == ["Subject: \nBody: hello"]


def test_probabilities_are_mapped_by_classes_not_column_order():
    fake = RecordingClassifier([1, 0], [0.9, 0.1])
    result = classify_email(fake, "s", "b")
    assert result.phishing_or_spam == pytest.approx(0.9)
    assert result.benign == pytest.approx(0.1)
    assert result.label == 1
    assert result.name == "phishing_or_spam"


def test_invalid_probabilities_raise_inference_error():
    fake = RecordingClassifier([0, 1], [float("nan"), 1.0])
    with pytest.raises(InferenceError):
        classify_email(fake, "s", "b")


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
    fake = RecordingClassifier([0, 1], [0.5, 0.5], error=RuntimeError(secret))
    monkeypatch.setattr(client.app.state, "classifier", fake)
    response = client.post("/api/v1/ml/classify", json={"body": "hello"})
    assert response.status_code == 500
    assert "prediction" not in response.json()
    assert secret not in response.text


def test_eml_plain_text_is_classified_with_training_format(client, monkeypatch):
    fake = RecordingClassifier([0, 1], [0.2, 0.8])
    monkeypatch.setattr(client.app.state, "classifier", fake)
    raw = make_eml(subject="Urgent verification", body="Click the link now.")
    response = client.post("/api/v1/ml/classify-eml", content=raw, headers={"content-type": EML_CONTENT_TYPE})
    assert response.status_code == 200
    assert fake.seen_texts == ["Subject: Urgent verification\nBody: Click the link now."]
    assert response.json()["prediction"]["label"] == 1


def test_eml_attachment_content_is_not_sent_to_classifier(client, monkeypatch):
    fake = RecordingClassifier([0, 1], [0.6, 0.4])
    monkeypatch.setattr(client.app.state, "classifier", fake)
    raw = make_eml(subject="Invoice", body="See attached.", attachment=b"MZ\x90\x00 binary payload")
    response = client.post("/api/v1/ml/classify-eml", content=raw, headers={"content-type": EML_CONTENT_TYPE})
    assert response.status_code == 200
    assert fake.seen_texts == ["Subject: Invoice\nBody: See attached."]


def test_eml_missing_subject_is_empty(client, monkeypatch):
    fake = RecordingClassifier([0, 1], [0.6, 0.4])
    monkeypatch.setattr(client.app.state, "classifier", fake)
    raw = make_eml(body="hello there")
    response = client.post("/api/v1/ml/classify-eml", content=raw, headers={"content-type": EML_CONTENT_TYPE})
    assert response.status_code == 200
    assert fake.seen_texts == ["Subject: \nBody: hello there"]


def test_eml_html_only_returns_422(client):
    raw = make_eml(subject="Hi", html="<p>Click <a href='https://example.com'>here</a></p>")
    response = client.post("/api/v1/ml/classify-eml", content=raw, headers={"content-type": EML_CONTENT_TYPE})
    assert response.status_code == 422
    assert "plain-text" in response.json()["detail"]


def test_eml_empty_body_returns_422(client):
    raw = make_eml(subject="Empty", body="   \n")
    response = client.post("/api/v1/ml/classify-eml", content=raw, headers={"content-type": EML_CONTENT_TYPE})
    assert response.status_code == 422


def test_eml_oversized_request_returns_413(client):
    raw = b"x" * (MAX_REQUEST_BYTES + 1)
    response = client.post("/api/v1/ml/classify-eml", content=raw, headers={"content-type": EML_CONTENT_TYPE})
    assert response.status_code == 413


def test_eml_parser_rejects_html_only_directly():
    raw = make_eml(subject="Hi", html="<b>only html</b>")
    with pytest.raises(EmlParseError):
        extract_subject_and_body(raw)


def test_eml_endpoint_real_model_returns_valid_probabilities(client):
    raw = make_eml(subject="Urgent account verification", body="Please verify your account using this link.")
    response = client.post("/api/v1/ml/classify-eml", content=raw, headers={"content-type": EML_CONTENT_TYPE})
    assert response.status_code == 200
    probs = [response.json()["probabilities"]["benign"], response.json()["probabilities"]["phishing_or_spam"]]
    assert all(0.0 <= p <= 1.0 for p in probs)
    assert math.isclose(sum(probs), 1.0, abs_tol=1e-5)


def test_missing_artifact_raises_clear_error(tmp_path):
    with pytest.raises(ModelLoadError, match="not found"):
        load_model(tmp_path / "missing.pkl")


def test_corrupted_artifact_raises_clear_error(tmp_path):
    bad = tmp_path / "corrupt.pkl"
    bad.write_bytes(b"not a pickle at all")
    with pytest.raises(ModelLoadError, match="Could not load"):
        load_model(bad)


def test_wrong_object_type_raises_clear_error(tmp_path):
    wrong = tmp_path / "wrong.pkl"
    joblib.dump({"not": "a model"}, wrong)
    with pytest.raises(ModelLoadError, match="not a fitted classifier"):
        load_model(wrong)


def test_startup_fails_when_artifact_missing(tmp_path):
    app = create_app(model_path=tmp_path / "missing.pkl")
    with pytest.raises(ModelLoadError):
        with TestClient(app):
            pass
