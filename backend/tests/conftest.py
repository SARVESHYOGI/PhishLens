import pytest
from fastapi.testclient import TestClient

from app.api import create_app


@pytest.fixture(scope="module")
def client():
    with TestClient(create_app()) as test_client:
        yield test_client
