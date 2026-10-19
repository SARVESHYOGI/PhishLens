"""Process entry point for the model service.

Run it with::

    uv run uvicorn main:app --app-dir src --reload

``--app-dir src`` puts the ``src`` directory on ``sys.path`` so the flat
modules (``api``, ``core``, ...) are importable.
"""

from api.app import create_app

app = create_app()


def run() -> None:
    """Start the service with uvicorn."""
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, app_dir="src")


if __name__ == "__main__":
    run()
