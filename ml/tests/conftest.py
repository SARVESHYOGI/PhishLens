"""Shared pytest fixtures."""

import pytest
from fastapi.testclient import TestClient

from api.app import create_app
from api.dependencies import get_classifier


@pytest.fixture
def client():
    """A TestClient bound to a freshly built application."""
    get_classifier.cache_clear()
    with TestClient(create_app()) as test_client:
        yield test_client
    get_classifier.cache_clear()
