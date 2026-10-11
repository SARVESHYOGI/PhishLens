# PhishLens — ML Model Build Guide (Google Colab Edition)

This document is a **single, runnable guide**. You open it, copy each cell into
Google Colab, run top to bottom, and at the end you download the trained model +
supporting files and drop them into this repo.

Everything runs on **synthetic feature data first** so you can build and verify
the whole training/evaluation pipeline today. When the real analyzers
(parser → headers → auth → URLs → domain → content) exist, you re-run the same
cells on real `features.csv` and retrain.

---

## 0. How to use this document in Colab

1. Go to <https://colab.research.google.com> → **New notebook**.
2. For each "CELL" below, add a new code cell and paste it.
3. Run cells **in order**. Colab resets on disconnect, so keep the notebook saved
   in your Google Drive.
4. At the end, **CELL 10** zips the artifacts and downloads them.
5. Put the downloaded files into the repo using the mapping in Section
   [Where these files go in the repo](#where-these-files-go-in-the-repo).

> Colab already ships Python 3.11/3.12 with `numpy`, `pandas`, `scikit-learn`.
> We only add `xgboost`, `shap`, `joblib`, `pyyaml`.

---

## 1. The ML task (freeze this contract)

| Item | Value |
| --- | --- |
| Task | Multi-class classification |
| Classes | `benign`, `phishing`, `spoofing`, `bec`, `malware` |
| Input | A fixed **feature vector** (18 numeric features), NOT raw email text |
| Output | Per-class probabilities + top contributing features |
| Metric priority | **Recall / F1 per attack class** (a missed phishing email is worse than a false alarm) |
| Later | Multi-label (an email can be `bec` + `spoofing`) |

**Why features and not raw text?** PhishLens is an *evidence-grounded forensics*
tool. The model must consume the same signals the rest of the pipeline produces
(SPF failure, Reply-To mismatch, suspicious URL, …) so predictions are
explainable and can be cited as evidence.

---

## 2. Feature schema (the contract file)

The 18 features, in order. **Never reorder these** — a saved model stores column
positions, and reordering silently corrupts predictions.

```text
authentication : spf_pass, dkim_pass, dmarc_pass
sender         : reply_to_mismatch, return_path_mismatch, display_name_mismatch
url/domain     : url_count, suspicious_url_count, ip_url, punycode, domain_age_days
content        : urgent_language, credential_request, financial_request, secrecy_language
attachments    : attachment_count, suspicious_attachment
```

---

# CELL 1 — Install dependencies

```python
!pip install -q xgboost shap joblib pyyaml
import sklearn, pandas, numpy, xgboost, shap
print("scikit-learn:", sklearn.__version__)
print("pandas      :", pandas.__version__)
print("xgboost     :", xgboost.__version__)
```

---

# CELL 2 — Project scaffold + schema

Creates the working tree in `/content/phishlens_ml` and defines the feature
contract that every part of the system must obey.

```python
import os, json, textwrap, datetime

ROOT = "/content/phishlens_ml"
for d in ["src/phishlens_ml", "data/splits", "models", "reports", "configs", "tests"]:
    os.makedirs(os.path.join(ROOT, d), exist_ok=True)

FEATURE_ORDER = [
    "spf_pass", "dkim_pass", "dmarc_pass",
    "reply_to_mismatch", "return_path_mismatch", "display_name_mismatch",
    "url_count", "suspicious_url_count", "ip_url", "punycode", "domain_age_days",
    "urgent_language", "credential_request", "financial_request", "secrecy_language",
    "attachment_count", "suspicious_attachment",
]

LABELS = ["benign", "phishing", "spoofing", "bec", "malware"]

# Persist the contract so the saved model can be validated later.
with open(os.path.join(ROOT, "feature_order.json"), "w") as f:
    json.dump({"feature_order": FEATURE_ORDER, "labels": LABELS}, f, indent=2)

print("FEATURE_ORDER:", len(FEATURE_ORDER), "features")
print("LABELS:", LABELS)
```

---

# CELL 3 — Write the reusable `phishlens_ml` package

Writes real `.py` modules to disk so you can export them into the repo. These are
the same files the backend will import.

```python
import os
ROOT = "/content/phishlens_ml"
PKG = os.path.join(ROOT, "src/phishlens_ml")
os.makedirs(PKG, exist_ok=True)

files = {}

files["schema.py"] = '''
"""Feature contract shared by the ML pipeline and the PhishLens backend."""
from dataclasses import dataclass, asdict

LABELS = ["benign", "phishing", "spoofing", "bec", "malware"]

@dataclass
class FeatureVector:
    spf_pass: int
    dkim_pass: int
    dmarc_pass: int
    reply_to_mismatch: int
    return_path_mismatch: int
    display_name_mismatch: int
    url_count: int
    suspicious_url_count: int
    ip_url: int
    punycode: int
    domain_age_days: int
    urgent_language: int
    credential_request: int
    financial_request: int
    secrecy_language: int
    attachment_count: int
    suspicious_attachment: int

    def to_row(self) -> dict:
        return asdict(self)

FEATURE_ORDER = list(FeatureVector.__dataclass_fields__.keys())
'''

files["dataset.py"] = '''
"""Load, clean and split the feature dataset without leaking labels."""
import pandas as pd
from sklearn.model_selection import train_test_split
from .schema import FEATURE_ORDER

def load(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    missing = [c for c in FEATURE_ORDER + ["label"] if c not in df.columns]
    if missing:
        raise ValueError(f"features.csv missing columns: {missing}")
    df = df.drop_duplicates(subset=FEATURE_ORDER)
    df = df.dropna(subset=FEATURE_ORDER + ["label"])
    return df

def split(df: pd.DataFrame, seed: int = 42):
    """Stratified train/val/test split. Keep campaign near-dupes together later."""
    train, temp = train_test_split(
        df, test_size=0.30, stratify=df["label"], random_state=seed)
    val, test = train_test_split(
        temp, test_size=0.50, stratify=temp["label"], random_state=seed)
    return train.reset_index(drop=True), val.reset_index(drop=True), test.reset_index(drop=True)
'''

files["train.py"] = '''
"""Build and fit candidate models."""
import joblib
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from .schema import FEATURE_ORDER, LABELS

def build_model(kind: str = "logreg"):
    if kind == "logreg":
        return Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ])
    if kind == "rf":
        return RandomForestClassifier(
            n_estimators=400, class_weight="balanced",
            random_state=42, n_jobs=-1)
    if kind == "xgb":
        from xgboost import XGBClassifier
        return XGBClassifier(
            n_estimators=500, max_depth=6, learning_rate=0.05,
            subsample=0.9, colsample_bytree=0.9,
            objective="multi:softprob", num_class=len(LABELS),
            eval_metric="mlogloss", random_state=42, n_jobs=-1)
    raise ValueError(f"unknown model kind: {kind}")

def fit(model, train_df):
    X = train_df[FEATURE_ORDER]
    y = train_df["label"]
    model.fit(X, y)
    return model

def save(model, path: str):
    joblib.dump(model, path)
    return path
'''

files["evaluate.py"] = '''
"""Metrics that matter for security: per-class precision/recall/F1 + ROC-AUC."""
import json
import numpy as np
import pandas as pd
from sklearn.metrics import (classification_report, confusion_matrix,
                             roc_auc_score, f1_score)
from .schema import FEATURE_ORDER, LABELS

def evaluate(model, df) -> dict:
    X = df[FEATURE_ORDER]
    y = df["label"]
    y_pred = model.predict(X)

    report_txt = classification_report(y, y_pred, labels=LABELS, digits=3, zero_division=0)
    cm = confusion_matrix(y, y_pred, labels=LABELS)

    out = {
        "macro_f1": float(f1_score(y, y_pred, labels=LABELS, average="macro", zero_division=0)),
        "per_class_f1": {lbl: float(f1_score(y, y_pred, labels=[lbl], average="macro", zero_division=0))
                         for lbl in LABELS},
        "confusion_matrix": cm.tolist(),
        "report_text": report_txt,
    }
    try:
        if hasattr(model, "predict_proba"):
            proba = model.predict_proba(X)
            out["roc_auc_ovr"] = float(roc_auc_score(
                pd.get_dummies(y)[LABELS].values, proba, multi_class="ovr", average="macro"))
    except Exception as e:
        out["roc_auc_ovr"] = None
        out["roc_auc_error"] = str(e)
    return out
'''

files["predict.py"] = '''
"""Serving interface the FastAPI backend imports."""
import numpy as np, joblib
from .schema import FEATURE_ORDER, LABELS

class PhishingModel:
    def __init__(self, path: str):
        bundle = joblib.load(path)
        self.model = bundle["model"]
        saved_order = bundle.get("feature_order", FEATURE_ORDER)
        if saved_order != FEATURE_ORDER:
            raise ValueError("Saved model feature order does not match schema!")
        self.feature_order = saved_order

    def predict(self, fv) -> dict:
        row = fv.to_row()
        x = np.array([[row[k] for k in self.feature_order]])
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(x)[0]
            classes = list(self.model.classes_)
            probabilities = {c: float(p) for c, p in zip(classes, probs)}
            label = max(probabilities, key=probabilities.get)
        else:
            label = str(self.model.predict(x)[0])
            probabilities = {label: 1.0}
        return {"label": label, "probabilities": probabilities}
'''

files["__init__.py"] = ""

for name, content in files.items():
    with open(os.path.join(PKG, name), "w") as f:
        f.write(content.lstrip("\n"))
print("Wrote:", ", ".join(files.keys()))
```

---

# CELL 4 — Generate a synthetic dataset (bootstrap)

Simulates plausible feature distributions per class so the pipeline is testable
end to end. `source=synthetic` is recorded so it never gets mistaken for real
data. **Replace this with real analyzer output later.**

```python
import numpy as np, pandas as pd, os
ROOT = "/content/phishlens_ml"
rng = np.random.default_rng(42)
N = 220  # per class

def clip_int(arr, lo, hi):
    return np.clip(np.round(arr), lo, hi).astype(int)

rows = []
def add(label, **kw):
    for _ in range(N):
        rows.append({
            "spf_pass": int(rng.random() < kw["spf"]),
            "dkim_pass": int(rng.random() < kw["dkim"]),
            "dmarc_pass": int(rng.random() < kw["dmarc"]),
            "reply_to_mismatch": int(rng.random() < kw["reply_to"]),
            "return_path_mismatch": int(rng.random() < kw["return_path"]),
            "display_name_mismatch": int(rng.random() < kw["display"]),
            "url_count": clip_int(rng.normal(kw["urls"], 1.2), 0, 12),
            "suspicious_url_count": clip_int(rng.normal(kw["susp_urls"], 0.8), 0, 8),
            "ip_url": int(rng.random() < kw["ip_url"]),
            "punycode": int(rng.random() < kw["puny"]),
            "domain_age_days": clip_int(rng.normal(kw["age"], kw["age_sd"]), 0, 8000),
            "urgent_language": int(rng.random() < kw["urgent"]),
            "credential_request": int(rng.random() < kw["cred"]),
            "financial_request": int(rng.random() < kw["fin"]),
            "secrecy_language": int(rng.random() < kw["secrecy"]),
            "attachment_count": clip_int(rng.normal(kw["attach"], 0.6), 0, 6),
            "suspicious_attachment": int(rng.random() < kw["susp_attach"]),
            "label": label,
            "source": "synthetic",
        })

# benign: mostly authenticated, old domains, no asks
add("benign", spf=.95, dkim=.92, dmarc=.9, reply_to=.05, return_path=.05, display=.03,
    urls=2, susp_urls=.2, ip_url=.02, puny=.01, age=3000, age_sd=1200,
    urgent=.1, cred=.05, fin=.1, secrecy=.02, attach=.8, susp_attach=.02)

# phishing: auth fails, suspicious urls, credential asks
add("phishing", spf=.2, dkim=.25, dmarc=.2, reply_to=.5, return_path=.4, display=.4,
    urls=4, susp_urls=2.5, ip_url=.3, puny=.25, age=60, age_sd=90,
    urgent=.7, cred=.85, fin=.25, secrecy=.2, attach=.4, susp_attach=.2)

# spoofing: auth fails hard, sender mismatches, low content asks
add("spoofing", spf=.08, dkim=.12, dmarc=.1, reply_to=.7, return_path=.7, display=.8,
    urls=2, susp_urls=1.0, ip_url=.2, puny=.15, age=200, age_sd=250,
    urgent=.4, cred=.3, fin=.3, secrecy=.2, attach=.3, susp_attach=.1)

# bec: authenticated sometimes (account takeover), financial + secrecy + urgency
add("bec", spf=.5, dkim=.55, dmarc=.5, reply_to=.6, return_path=.5, display=.6,
    urls=1, susp_urls=.4, ip_url=.05, puny=.05, age=800, age_sd=700,
    urgent=.85, cred=.15, fin=.9, secrecy=.7, attach=.5, susp_attach=.15)

# malware: suspicious attachments dominate
add("malware", spf=.35, dkim=.4, dmarc=.35, reply_to=.35, return_path=.3, display=.35,
    urls=2, susp_urls=.8, ip_url=.15, puny=.1, age=300, age_sd=400,
    urgent=.5, cred=.2, fin=.3, secrecy=.15, attach=1.8, susp_attach=.85)

df = pd.DataFrame(rows).sample(frac=1, random_state=42).reset_index(drop=True)
out = os.path.join(ROOT, "data/features.csv")
df.to_csv(out, index=False)
print(df["label"].value_counts())
print("Shape:", df.shape, "->", out)
```

---

# CELL 5 — Load, clean and split

```python
import sys, os, pandas as pd
sys.path.insert(0, "/content/phishlens_ml/src")
from phishlens_ml.dataset import load, split
from phishlens_ml.schema import FEATURE_ORDER

df = load("/content/phishlens_ml/data/features.csv")
train, val, test = split(df, seed=42)
ROOT = "/content/phishlens_ml"
train.to_csv(f"{ROOT}/data/splits/train.csv", index=False)
val.to_csv(f"{ROOT}/data/splits/val.csv", index=False)
test.to_csv(f"{ROOT}/data/splits/test.csv", index=False)

print("train", train.shape, "val", val.shape, "test", test.shape)
print(train["label"].value_counts())
```

---

# CELL 6 — Train the three candidates

Logistic Regression (baseline) → Random Forest → XGBoost. Always keep the
baseline: if a complex model can't beat it, something is off.

```python
import sys, os, joblib
sys.path.insert(0, "/content/phishlens_ml/src")
from phishlens_ml.train import build_model, fit
from phishlens_ml.schema import FEATURE_ORDER

ROOT = "/content/phishlens_ml"
models = {}
for kind in ["logreg", "rf", "xgb"]:
    print(f"\n=== training {kind} ===")
    m = build_model(kind)
    fit(m, train)
    bundle = {"model": m, "feature_order": FEATURE_ORDER, "kind": kind}
    path = f"{ROOT}/models/{kind}.joblib"
    joblib.dump(bundle, path)
    models[kind] = m
    print("saved", path)
```

---

# CELL 7 — Evaluate and compare

```python
import sys, json, joblib, pandas as pd, numpy as np
sys.path.insert(0, "/content/phishlens_ml/src")
from phishlens_ml.evaluate import evaluate
from phishlens_ml.schema import LABELS

ROOT = "/content/phishlens_ml"
test = pd.read_csv(f"{ROOT}/data/splits/test.csv")
val  = pd.read_csv(f"{ROOT}/data/splits/val.csv")

results = {}
for kind in ["logreg", "rf", "xgb"]:
    model = joblib.load(f"{ROOT}/models/{kind}.joblib")["model"]
    res = evaluate(model, test)
    results[kind] = res
    print(f"\n########## {kind} ##########")
    print(res["report_text"])
    print("macro_f1:", round(res["macro_f1"], 3),
          "| roc_auc_ovr:", res.get("roc_auc_ovr"))

# pick the winner by macro F1
best_kind = max(results, key=lambda k: results[k]["macro_f1"])
print("\n>>> BEST MODEL:", best_kind)

with open(f"{ROOT}/reports/metrics.json", "w") as f:
    json.dump({"best_kind": best_kind, "results": results}, f, indent=2)
```

---

# CELL 8 — Explainability (global + per-email SHAP)

This is what powers the dashboard's "top contributing signals".

```python
import sys, os, joblib, pandas as pd, numpy as np
sys.path.insert(0, "/content/phishlens_ml/src")
from phishlens_ml.schema import FEATURE_ORDER

ROOT = "/content/phishlens_ml"
best_kind = __import__("json").load(open(f"{ROOT}/reports/metrics.json"))["best_kind"]
model = joblib.load(f"{ROOT}/models/{best_kind}.joblib")["model"]
test = pd.read_csv(f"{ROOT}/data/splits/test.csv")

# --- global importance (tree models) ---
if best_kind in ("rf", "xgb"):
    inner = model.named_steps["clf"] if hasattr(model, "named_steps") else model
    imp = pd.Series(inner.feature_importances_, index=FEATURE_ORDER).sort_values(ascending=False)
    imp.to_csv(f"{ROOT}/reports/feature_importance.csv")
    print("Top global features:\n", imp.head(10))

# --- per-email explanation with SHAP ---
import shap
X_test = test[FEATURE_ORDER]
try:
    explainer = shap.TreeExplainer(model)
    sample = X_test.iloc[[0]]
    sv = explainer.shap_values(sample)
    # shap_values shape varies by version/class; normalize to (features,)
    arr = np.array(sv)
    if arr.ndim == 3:            # (n_samples, n_features, n_classes)
        arr = arr[0, :, 0]
    elif isinstance(sv, list):   # list per class
        arr = np.array(sv[0])[0]
    else:
        arr = arr[0]
    expl = pd.Series(arr, index=FEATURE_ORDER).sort_values(key=abs, ascending=False)
    print("\nTop signals for first test email:")
    print(expl.head(5))
except Exception as e:
    print("SHAP skipped:", e)
```

---

# CELL 9 — Save the winning model + model card

A model file without provenance is magic. The model card records feature order,
metrics, and limitations.

```python
import sys, os, json, shutil, joblib, datetime, yaml
ROOT = "/content/phishlens_ml"

metrics = json.load(open(f"{ROOT}/reports/metrics.json"))
best_kind = metrics["best_kind"]
best = metrics["results"][best_kind]

# promote best -> production.joblib
shutil.copy(f"{ROOT}/models/{best_kind}.joblib", f"{ROOT}/models/production.joblib")

with open(f"{ROOT}/feature_order.json") as f:
    contract = json.load(f)

card = {
    "model": best_kind,
    "artifact": "production.joblib",
    "trained_on": datetime.date.today().isoformat(),
    "dataset": "synthetic bootstrap (data/features.csv)",
    "rows_total": int(sum(1 for _ in open(f"{ROOT}/data/features.csv")) - 1),
    "labels": contract["labels"],
    "feature_order": contract["feature_order"],
    "metrics_test": {
        "macro_f1": best["macro_f1"],
        "roc_auc_ovr": best.get("roc_auc_ovr"),
        "per_class_f1": best["per_class_f1"],
    },
    "limitations": [
        "Trained on SYNTHETIC feature distributions, not real emails.",
        "Retrain on analyzer-generated features before trusting predictions.",
        "No campaign grouping yet -> watch for data leakage when using real data.",
    ],
}
with open(f"{ROOT}/models/model_card.yaml", "w") as f:
    yaml.safe_dump(card, f, sort_keys=False)
print(yaml.safe_dump(card, sort_keys=False))
```

---

# CELL 10 — Sanity-check the serving interface, then export a ZIP

```python
import sys, joblib
sys.path.insert(0, "/content/phishlens_ml/src")
from phishlens_ml.predict import PhishingModel
from phishlens_ml.schema import FeatureVector

clf = PhishingModel("/content/phishlens_ml/models/production.joblib")

sample = FeatureVector(
    spf_pass=0, dkim_pass=0, dmarc_pass=0,
    reply_to_mismatch=1, return_path_mismatch=1, display_name_mismatch=1,
    url_count=1, suspicious_url_count=0, ip_url=0, punycode=0, domain_age_days=900,
    urgent_language=1, credential_request=0, financial_request=1, secrecy_language=1,
    attachment_count=0, suspicious_attachment=0,
)
print("BEC-like sample ->", clf.predict(sample))
```

```python
import shutil, os
from google.colab import files

# remove the throwaway per-model duplicates to keep the export small (optional)
shutil.make_archive("/content/phishlens_ml_export", "zip", "/content/phishlens_ml")
files.download("/content/phishlens_ml_export.zip")
```

> If the file is large or you want persistence, mount Drive instead:
> ```python
> from google.colab import drive; drive.mount("/content/drive")
> # copy /content/phishlens_ml_export.zip to /content/drive/MyDrive/
> ```

---

## Read the metrics correctly

- **macro F1** — average across all 5 classes; punishes ignoring rare classes.
- **per-class recall** — of all real `phishing` emails, how many did we catch?
  In security this is the number that matters most (missed attacks = false negatives).
- **per-class precision** — of emails we flagged, how many were real? Low precision
  means analyst fatigue from false alarms.
- **ROC-AUC (ovr)** — ranking quality; useful but secondary to recall/F1 here.

Because attack classes are rarer in the real world, `class_weight="balanced"` and
threshold tuning toward recall are deliberate choices — don't "fix" them to boost
accuracy.

---

## Where these files go in the repo

After unzipping locally, copy the pieces into PhishLens like this:

| From the export | Goes to (repo path) | Notes |
| --- | --- | --- |
| `src/phishlens_ml/*.py` | `ml/src/phishlens_ml/` | The reusable package |
| `data/features.csv` | `datasets/processed/features.csv` | Generated feature table |
| `data/splits/*.csv` | `datasets/processed/splits/` | train/val/test |
| `models/production.joblib` | `ml/models/production.joblib` | The model the backend loads |
| `models/model_card.yaml` | `ml/models/model_card.yaml` | Provenance + limitations |
| `reports/metrics.json` | `reports/ml/metrics.json` | Eval results |
| `reports/feature_importance.csv` | `reports/ml/feature_importance.csv` | Global importances |
| `feature_order.json` | `ml/feature_order.json` | The contract |

Quick copy (from the unzipped folder, adjusted to your path):

```powershell
# run from repo root E:\projects\personalproject\PhishLens
$E = "C:\path\to\unzipped\phishlens_ml"
Copy-Item -Recurse -Force "$E\src\phishlens_ml" ".\ml\src\phishlens_ml"
New-Item -ItemType Directory -Force ".\datasets\processed\splits" | Out-Null
New-Item -ItemType Directory -Force ".\reports\ml" | Out-Null
Copy-Item -Force "$E\data\features.csv" ".\datasets\processed\features.csv"
Copy-Item -Force "$E\data\splits\*.csv" ".\datasets\processed\splits\"
Copy-Item -Force "$E\models\production.joblib" ".\ml\models\production.joblib"
Copy-Item -Force "$E\models\model_card.yaml" ".\ml\models\model_card.yaml"
Copy-Item -Force "$E\reports\metrics.json" ".\reports\ml\metrics.json"
Copy-Item -Force "$E\reports\feature_importance.csv" ".\reports\ml\feature_importance.csv"
Copy-Item -Force "$E\feature_order.json" ".\ml\feature_order.json"
```

---

## Run order cheat-sheet

```text
CELL 1  install deps
CELL 2  scaffold + freeze feature schema
CELL 3  write phishlens_ml package
CELL 4  generate synthetic features.csv
CELL 5  load + clean + split
CELL 6  train logreg / rf / xgb
CELL 7  evaluate + pick winner
CELL 8  SHAP explainability
CELL 9  save production model + model card
CELL 10 predict smoke test + export ZIP
```

---

## What to do after this works (the real ML step)

The model above proves the pipeline. To make it *real*:

1. Finish Stages 2–8 from `steps.md` (parser → headers → auth → URL → domain →
   content analyzers).
2. Write a `feature_builder` that runs those analyzers over `samples/**/*.eml`
   and emits one CSV row per email matching `FEATURE_ORDER`.
3. Regenerate `features.csv` from real emails (public phishing corpora + your
   synthetic attack scenarios), add a `group` column per campaign.
4. Re-run **CELL 5 → CELL 10** unchanged, but split with
   `GroupShuffleSplit` on `group` to prevent leakage.
5. Promote the new model card, and only then wire `PhishingModel` into the
   FastAPI investigation pipeline.

> Golden rule: the training code should never need to change when real data
> arrives — only `features.csv` changes. That is the whole point of freezing the
> schema in CELL 2.
