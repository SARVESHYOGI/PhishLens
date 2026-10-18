from pathlib import Path

ML_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ML_ROOT / "models" / "baseline_model.pkl"

HF_MODEL_ID = "jagan-raj/PhishMail"

MAX_SUBJECT_CHARS = 300
MAX_BODY_CHARS = 50_000
