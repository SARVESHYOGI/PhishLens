# MailSleuth AI Backend

FastAPI service with a swappable text-classification component.

## Scope

The current classifier is a **binary text classifier** (TF-IDF + Logistic Regression) over an
email's subject and body. It is not a forensic engine. It does not analyze headers,
SPF/DKIM/DMARC, URLs, attachments, spoofing, or business email compromise. A
`phishing_or_spam` result is not proof of phishing, and a `benign` result is not proof
that an email is safe. Its labels reflect agreement with the dataset labels.

## Design

The backend depends on a small `TextClassifier` interface:

```python
class TextClassifier:
    name: str  # short identifier for logs and responses
    def predict(self, subject: str, body: str) -> Classification: ...
```

This makes it easy to swap implementations without changing the API or the frontend.
The default provider is the baseline model you trained (`ml/models/baseline_model.pkl`).

## Model artifact (baseline)

- Location: `ml/models/baseline_model.pkl` (project root, resolved from the file path,
  not the working directory).
- Metrics: `ml/models/baseline_metrics.json` (test set: 40,604 rows, accuracy 0.9812,
  ROC-AUC 0.9981).
- Loaded once at application startup and stored on `app.state.classifier`.
- Loaded with `joblib`, which uses pickle. Only load artifacts produced by your own
  training workflow. Never load user-supplied files.
- Replacing the model: train a new pipeline with the same `build_email_text` format,
  save it with `joblib.dump` to `ml/models/baseline_model.pkl`, and restart the server.
  The loader requires a fitted classifier with `predict_proba` and `classes_` = `[0, 1]`.
  Keep the old file until the new one passes the tests.

## Provider selection

Set the environment variable `PHISHLENS_CLASSIFIER` to choose the provider at startup.
Supported values:

| Value | Meaning |
| --- | --- |
| `baseline` (default) | The TF-IDF + logistic regression model in `ml/models/baseline_model.pkl` |
| `hf` | A Hugging Face Transformers model (optional dependencies) |

If the variable is unset or set to an unknown name, the server fails to start with a clear
message.

### HF provider (optional)

The HF provider loads a model from the Hugging Face Hub. It requires the optional
dependencies `torch` and `transformers`. Install them with:

```powershell
cd backend
uv sync --group hf
```

Then start with `PHISHLENS_CLASSIFIER=hf uv run python main.py`.

The HF provider expects a model that outputs two logits (classes 0 and 1) and uses the
same `Subject: ...\nBody: ...` format as the baseline.

## Setup

Requires Python 3.14 (`.python-version`, `requires-python`) and [uv](https://docs.astral.sh/uv/).

```powershell
cd backend
uv sync
```

Tested versions: Python 3.14.4, scikit-learn 1.9.1, joblib 1.6.0, FastAPI 0.143.0,
uvicorn 0.54.0, pytest 9.1.1, httpx 0.28.1.

The baseline model was trained with scikit-learn 1.6.1 (see `ml/models/ml.ipynb`). Loading it under
1.9.1 emits `InconsistentVersionWarning`. The tests pass, but this has not been checked
against the training metrics. Treat the predictions as unverified until they are.

## Run the server

```powershell
cd backend
uv run python main.py
```

Listens on `http://127.0.0.1:8000`. Interactive docs: `http://127.0.0.1:8000/docs`.

## API

### `POST /api/v1/ml/classify`

Request:

```json
{ "subject": "Urgent account verification", "body": "Please verify your account using this link." }
```

- `subject`: optional, defaults to `""`, max 300 characters, whitespace stripped.
- `body`: required, 1 to 50,000 characters after stripping, must not be blank.
- Unknown fields are rejected. The request body is limited to 256 KiB by
  `Content-Length`. Chunked requests without that header are not size-limited by the
  middleware, so the body is not capped in that case. Add a proxy-level limit before
  exposing this service.
- Long bodies are rejected with 422, not truncated.

Preprocessing matches training: the text sent to the model is
`"Subject: <subject>\nBody: <body>"`, with both fields stripped.

Response (200):

```json
{
  "model": "tfidf_logistic_regression_baseline",
  "prediction": { "label": 1, "name": "phishing_or_spam" },
  "probabilities": { "benign": 0.08, "phishing_or_spam": 0.92 },
  "disclaimer": "This is a binary text-classification result, not a verified forensic verdict."
}
```

### `POST /api/v1/ml/classify-eml`

Request body: raw RFC 822 email bytes (`Content-Type: message/rfc822`), up to 256 KiB.

- The `Subject` header becomes the subject. The first `text/plain` part that is not an
  attachment becomes the body.
- Attachments are ignored. Their content is never sent to the model, executed, or opened.
- HTML-only emails return 422 because the model was trained on plain text. HTML is not
  converted.
- Empty or whitespace-only bodies return 422.
- Response: same as `/api/v1/ml/classify`.

Errors:

| Status | Meaning |
| --- | --- |
| 413 | `Content-Length` above 256 KiB |
| 422 | Validation failed. `detail` lists `loc`, `msg`, `type` only. Input is not echoed. |
| 500 | Inference failed. Generic message. No prediction is returned. |

Example:

```powershell
curl -X POST http://127.0.0.1:8000/api/v1/ml/classify -H "Content-Type: application/json" -d "{\"subject\":\"Urgent\",\"body\":\"Verify your account\"}"
```

Startup fails with a clear message if the artifact is missing, corrupt, or not a binary
classifier. The message names the file but not the full path.

## Tests

```powershell
cd backend
uv run pytest
```

Test coverage: model loading from the project path, endpoint response shape, probability
sums and ranges, label mapping by `classes_`, training-format preprocessing, missing
subject handling, validation errors, size limit, inference failure (mocked classifier),
and missing/corrupt/wrong-type artifacts.

## Known limitations

- Text-only. Header, URL, domain, and attachment analysis are not implemented.
- No authentication or rate limiting exists in the repository yet. Add them before any
  public deployment.
- Email content is not logged. Only exception type names are logged on inference failure.
- Nothing is stored. Submitted emails are not persisted.
- Training data labels are not verified phishing ground truth.
- Starlette reports that the `httpx` test client is deprecated in favor of `httpx2`. This
  is a warning only.

## Future work

The backend is ready for a second classifier (for example, a Hugging Face Transformers
model). To add one:

1. Implement the `TextClassifier` interface in a new file under `app/`.
2. Add the provider name to the `if/elif` chain in `app/api.py`.
3. If the model needs heavy dependencies, put them in an optional dependency group
   (like `hf` in `pyproject.toml`) and document the install command.
4. Run the evaluation script to compare it against the baseline on the same test split.
5. Decide which one should be the default.
