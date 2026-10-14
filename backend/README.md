### Provider selection

Set the environment variable `PHISHLENS_CLASSIFIER` to choose the provider at startup. Supported values:

| Value | Meaning |
| --- | --- |
| `baseline` (default) | The TF-IDF + logistic regression model in `ml/models/baseline_model.pkl` |
| `hf` | A Hugging Face Transformers model (optional dependencies) |

If the variable is unset or set to an unknown name, the server fails to start with a clear error.

#### HF provider (optional)

The HF provider loads a model from the Hugging Face Hub. It requires the optional dependencies `torch` and `transformers`. Install them with:

```powershell
cd backend
uv sync --python 3.14 --with datasets
uv pip install "scikit-learn==1.6.1" "joblib>=1.6.0" "fastapi>=0.143.0" "uvicorn>=0.54.0"
```

Then start with:

```powershell
uv run --with datasets python main.py
```

or set the environment variable:

```powershell
$env:PHISHLENS_CLASSIFIER = "hf"
uv run python main.py
```

The HF provider expects a model that outputs two logits (classes 0 and 1) and uses the same `Subject: ...\nBody: ...` text format as the baseline. You can use any model from the Hugging Face Hub that meets these requirements, such as `jagan-raj/PhishMail` (a BERT model fine-tuned on phishing email text).

**Important:** The HF provider requires Python 3.14+ and `torch`/`transformers`. It does not use scikit-learn. The baseline model was trained with scikit-learn 1.6.1; loading it under 1.9.1 produces `InconsistentVersionWarning` messages but should still work for inference.
