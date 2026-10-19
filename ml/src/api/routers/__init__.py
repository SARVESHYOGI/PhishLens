"""HTTP routers.

Import the routers here and include them in :func:`api.app.create_app`.
"""

from api.routers import classification, health

__all__ = ["classification", "health"]
