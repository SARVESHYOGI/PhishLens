"""Tests for the health and model-listing endpoints."""


def test_health_returns_ok(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ready_returns_ok(client):
    assert client.get("/ready").status_code == 200


def test_models_lists_available_models(client):
    response = client.get("/v1/models")
    assert response.status_code == 200
    names = {entry["name"] for entry in response.json()["available"]}
    assert names == {"baseline", "huggingface"}


def test_classify_unknown_model_returns_400(client):
    response = client.post("/v1/classify", json={"body": "hello", "model": "nope"})
    assert response.status_code == 400
    assert "Unknown model" in response.json()["detail"]


def test_classify_blank_body_returns_422(client):
    assert client.post("/v1/classify", json={"body": "   "}).status_code == 422


def test_classify_unimplemented_provider_returns_503(client):
    response = client.post("/v1/classify", json={"body": "hello"})
    assert response.status_code == 503
