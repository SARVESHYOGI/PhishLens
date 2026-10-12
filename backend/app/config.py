from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "ml" / "models" / "baseline_model.pkl"

MAX_REQUEST_BYTES = 256 * 1024
MAX_SUBJECT_CHARS = 300
MAX_BODY_CHARS = 50_000
