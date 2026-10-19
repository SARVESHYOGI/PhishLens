"""Runtime configuration for the model service.

Values are read from environment variables once at import time. Copy
``.env.example`` to ``.env`` or export the variables in the process
environment to override the defaults.
"""

import os
from dataclasses import dataclass
from pathlib import Path

# ``config.py`` lives at ``<project>/src/config.py``; ``src`` is on sys.path.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = PROJECT_ROOT / "models"

BASELINE = "baseline"
HUGGINGFACE = "huggingface"


@dataclass(frozen=True)
class Settings:
    """Immutable service settings resolved at startup."""

    app_name: str = "PhishLens Model Service"
    version: str = "0.1.0"
    model_dir: Path = MODEL_DIR
    default_model: str = os.environ.get("PHISHLENS_DEFAULT_MODEL", BASELINE)
    hf_model_id: str = os.environ.get("PHISHLENS_HF_MODEL_ID", "jagan-raj/PhishMail")
    max_subject_chars: int = 300
    max_body_chars: int = 50_000
    log_level: str = os.environ.get("PHISHLENS_LOG_LEVEL", "INFO")
    available_models: tuple[str, ...] = (BASELINE, HUGGINGFACE)


settings = Settings()
