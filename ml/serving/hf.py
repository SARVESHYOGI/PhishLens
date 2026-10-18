import math
from typing import Any

from serving.preprocess import build_email_text

from serving.base import (
    LABEL_NAMES,
    Classification,
    InferenceError,
    ProviderUnavailable,
)
from serving.config import HF_MODEL_ID


class HuggingFaceClassifier:
    def __init__(self, model_id: str = HF_MODEL_ID) -> None:
        try:
            import torch
            from transformers import AutoModelForSequenceClassification, AutoTokenizer
        except ImportError as exc:
            raise ProviderUnavailable(
                "The hf provider needs 'torch' and 'transformers'. "
                "Install them in the ml project, then restart the service."
            ) from exc

        self._torch = torch
        self.name = model_id
        try:
            self._tokenizer = AutoTokenizer.from_pretrained(model_id)
            self._model = AutoModelForSequenceClassification.from_pretrained(model_id)
        except (OSError, ValueError) as exc:
            raise ProviderUnavailable(
                f"Could not load Hugging Face model '{model_id}' ({type(exc).__name__}). "
                "Check the model id and the network connection."
            ) from exc
        self._model.eval()
        self._phishing_index = self._resolve_phishing_index()

    def _resolve_phishing_index(self) -> int:
        id2label = getattr(self._model.config, "id2label", {}) or {}
        for index, label in id2label.items():
            if "phish" in str(label).lower() or "spam" in str(label).lower():
                return int(index)
        return 1

    def predict(self, subject: str, body: str) -> Classification:
        text = build_email_text(subject, body)
        inputs = self._tokenizer(
            text, return_tensors="pt", truncation=True, max_length=512
        )
        with self._torch.no_grad():
            logits = self._model(**inputs).logits
            probabilities = self._torch.softmax(logits, dim=-1)[0]

        phishing = float(probabilities[self._phishing_index])
        benign = float(probabilities[1 - self._phishing_index])
        if not (math.isfinite(benign) and math.isfinite(phishing)):
            raise InferenceError("Model returned invalid probabilities.")
        if abs((benign + phishing) - 1.0) > 1e-5:
            raise InferenceError("Model returned invalid probabilities.")

        label = 1 if phishing >= benign else 0
        return Classification(
            label=label,
            name=LABEL_NAMES[label],
            benign=benign,
            phishing_or_spam=phishing,
        )
