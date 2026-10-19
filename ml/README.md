# PhishLens ML service

Model training, evaluation, and serving for PhishLens. This is a standalone
FastAPI service that exposes the phishing classifier over HTTP; the main
application backend consumes it (or imports the same artifacts).

## Layout

`src/` is the import root (put on `sys.path` via `.pth`/`--app-dir`, or
`pythonpath` for pytest), so the modules below are imported top-level, e.g.
`from api.app import create_app`.

```text
ml/
├── configs/                     # YAML/JSON experiment and app configuration
├── data/                        # datasets (contents are git-ignored)
│   ├── raw/                     #   immutable source data
│   ├── interim/                 #   intermediate, partly processed data
│   └── processed/               #   model-ready features
├── docs/
│   └── training-guide.md        # the Colab model build guide
├── models/                      # trained artifacts + metrics (versioned)
│   ├── baseline_model.pkl
│   ├── baseline_metrics.json
│   └── ml.ipynb
├── notebooks/experiments/
├── reports/                     # generated figures and metrics reports
├── scripts/                     # one-off operational scripts
├── src/                         # the application (import root)
│   ├── api/                     #   HTTP boundary
│   │   ├── app.py               #     create_app() factory + lifespan
│   │   ├── dependencies.py      #     shared FastAPI dependencies
│   │   ├── errors.py            #     domain exception -> HTTP mapping
│   │   └── routers/             #     one module per resource
│   │       ├── health.py
│   │       └── classification.py
│   ├── core/                    #   exceptions.py, logging.py
│   ├── config.py                #   environment-driven settings
│   ├── main.py                  #   process entry point (ASGI `app`)
│   ├── data/preprocessing.py
│   ├── inference/               #   base.py (protocol), registry.py
│   ├── schemas/classification.py#   Pydantic request/response contracts
│   └── training/                #   train.py, evaluate.py (placeholders)
└── tests/
    ├── unit/                    #   pure-function tests
    └── integration/             #   HTTP-level tests
```

The `api` -> `schemas` / `inference` / `data` dependency direction is
one-way: routers never load models directly, they go through the inference
registry.

## Setup

```powershell
cd ml
uv sync
```

## Run

```powershell
uv run uvicorn main:app --app-dir src --reload
```

Interactive docs are at <http://127.0.0.1:8000/docs>.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness probe |
| `GET` | `/ready` | Readiness probe |
| `GET` | `/v1/models` | List servable models |
| `POST` | `/v1/classify` | Classify a subject + body |

## Test

```powershell
uv run pytest
```

## Adding an endpoint

1. Add request/response models in `src/schemas/`.
2. Put domain logic in `src/inference/`, `src/data/`, or `src/training/`
   (never in the router).
3. Create `src/api/routers/<resource>.py` with an `APIRouter`.
4. Register the router in `src/api/routers/__init__.py` and include it in
   `src/api/app.py`.
5. Add an integration test under `tests/integration/`.

## Adding a model provider

Implement the `TextClassifier` protocol (`src/inference/base.py`), raise
`ModelLoadError` / `InferenceError` / `ProviderUnavailable` where
appropriate, and register a factory in `src/inference/registry.py`. Until a
provider is registered, `POST /v1/classify` returns `503`.

## Configuration

Settings come from environment variables (see `.env.example`):

| Variable | Default | Meaning |
| --- | --- | --- |
| `PHISHLENS_DEFAULT_MODEL` | `baseline` | Provider used when a request omits `model` |
| `PHISHLENS_HF_MODEL_ID` | `jagan-raj/PhishMail` | Checkpoint for the Hugging Face provider |
| `PHISHLENS_LOG_LEVEL` | `INFO` | Root log level |