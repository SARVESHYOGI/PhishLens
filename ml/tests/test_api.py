import pytest
from fastapi.testclient import TestClient

from api.index import _cache, app
from serving.base import Classification, ProviderUnavailable
from serving.config import AVAILABLE_CLASSIFIERS


class FakeClassifier:
    name = "fake"

    def __init__(self, result=None, error=None):
        self._result = result
        self._error = error
        self.seen = []

    def predict(self, subject, body):
        self.seen.append((subject, body))
        if self._error is not None:
            raise self._error
        return self._result


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
    _cache.clear()


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_models_lists_providers(client):
    response = client.get("/v1/models")
    assert response.status_code == 200
    assert set(response.json()["available"]) == set(AVAILABLE_CLASSIFIERS)


def test_classify_passes_subject_and_body_to_provider(client):
    fake = FakeClassifier(
        result=Classification(
            label=1, name="phishing_or_spam", benign=0.2, phishing_or_spam=0.8
        )
    )
    _cache["baseline"] = fake
    response = client.post("/v1/classify", json={"subject": " S ", "body": " hello "})
    assert response.status_code == 200
    body = response.json()
    assert body["prediction"] == {"label": 1, "name": "phishing_or_spam"}
    assert body["probabilities"] == {"benign": 0.2, "phishing_or_spam": 0.8}
    assert body["model"] == "fake"
    assert fake.seen == [("S", "hello")]


def test_classify_defaults_to_baseline(client):
    fake = FakeClassifier(
        result=Classification(label=0, name="benign", benign=0.9, phishing_or_spam=0.1)
    )
    _cache["baseline"] = fake
    response = client.post("/v1/classify", json={"body": "hello"})
    assert response.status_code == 200
    assert fake.seen == [("", "hello")]


def test_unknown_model_returns_400(client):
    response = client.post("/v1/classify", json={"body": "hello", "model": "nope"})
    assert response.status_code == 400
    assert "Unknown classifier" in response.json()["detail"]


def test_blank_body_returns_422(client):
    response = client.post("/v1/classify", json={"body": "   "})
    assert response.status_code == 422


def test_unknown_field_returns_422(client):
    response = client.post("/v1/classify", json={"body": "hello", "extra": 1})
    assert response.status_code == 422


def test_provider_unavailable_returns_503(client, monkeypatch):
    def unavailable(name):
        raise ProviderUnavailable("torch and transformers are not installed")

    monkeypatch.setattr("api.index.load_classifier", unavailable)
    _cache.pop("hf", None)
    response = client.post("/v1/classify", json={"body": "hello", "model": "hf"})
    assert response.status_code == 503


def test_real_baseline_end_to_end(client):
    response = client.post(
        "/v1/classify",
        json={"subject": "Urgent", "body": "Please verify your account using this link."},
    )
    assert response.status_code == 200
    probabilities = response.json()["probabilities"]
    total = probabilities["benign"] + probabilities["phishing_or_spam"]
    assert pytest.approx(total, abs=1e-5) == 1.0
