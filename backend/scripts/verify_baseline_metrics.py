import json
import sys
from pathlib import Path

import joblib
from datasets import load_dataset
from sklearn.metrics import accuracy_score, confusion_matrix, roc_auc_score

BACKEND_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_DIR.parent
METRICS_PATH = PROJECT_ROOT / "ml" / "models" / "baseline_metrics.json"
DATASET_ID = "mamtakumar/seven-phishing-email-datasets"
DATASET_REVISION = "c9440a2fd59c3992e53c361f6afbb4fa8952cd17"


def normalize(series):
    return series.fillna("").astype(str).str.strip()


def build_email_text(df):
    return "Subject: " + normalize(df["subject"]) + "\n" + "Body: " + normalize(df["text"])


def main() -> None:
    sys.path.insert(0, str(BACKEND_DIR))
    from app.config import MODEL_PATH

    dataset = load_dataset(DATASET_ID, revision=DATASET_REVISION)
    test_df = dataset["test"].to_pandas()
    x_test = build_email_text(test_df)
    y_test = test_df["label"].astype(int).to_numpy()

    model = joblib.load(MODEL_PATH)
    proba = model.predict_proba(x_test)
    positive_col = list(model.classes_).index(1)
    y_score = proba[:, positive_col]
    y_pred = model.classes_[proba.argmax(axis=1)]

    computed = {
        "rows": int(len(y_test)),
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "roc_auc": float(roc_auc_score(y_test, y_score)),
        "confusion_matrix": confusion_matrix(y_test, y_pred, labels=[0, 1]).tolist(),
    }

    saved = json.loads(METRICS_PATH.read_text(encoding="utf-8"))["test"]
    saved_cm = [
        [saved["true_negatives"], saved["false_positives"]],
        [saved["false_negatives"], saved["true_positives"]],
    ]

    print(f"Rows: computed={computed['rows']} saved={saved['rows']}")
    print(f"Accuracy: computed={computed['accuracy']:.4f} saved={saved['accuracy']}")
    print(f"ROC-AUC: computed={computed['roc_auc']:.4f} saved={saved['roc_auc']}")
    print(f"Confusion matrix: computed={computed['confusion_matrix']} saved={saved_cm}")

    matches = (
        computed["rows"] == saved["rows"]
        and round(computed["accuracy"], 4) == saved["accuracy"]
        and round(computed["roc_auc"], 4) == saved["roc_auc"]
        and computed["confusion_matrix"] == saved_cm
    )
    print("MATCH" if matches else "MISMATCH")
    if not matches:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
