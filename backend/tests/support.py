from email.message import EmailMessage

import numpy as np


class RecordingModel:
    def __init__(self, classes, row, error=None):
        self.classes_ = np.array(classes)
        self._row = np.array([row])
        self._error = error
        self.seen_texts = []

    def predict_proba(self, texts):
        self.seen_texts.extend(texts)
        if self._error is not None:
            raise self._error
        return self._row


class FakeClassifier:
    name = "fake"

    def __init__(self, result=None, error=None):
        self._result = result
        self._error = error

    def predict(self, subject, body):
        if self._error is not None:
            raise self._error
        return self._result


def make_eml(subject=None, body=None, html=None, attachment=None) -> bytes:
    msg = EmailMessage()
    if subject is not None:
        msg["Subject"] = subject
    msg["From"] = "sender@example.com"
    msg["To"] = "user@example.com"
    if html is not None:
        msg.set_content(html, subtype="html")
    else:
        msg.set_content(body if body is not None else "")
    if attachment is not None:
        msg.add_attachment(
            attachment,
            maintype="application",
            subtype="octet-stream",
            filename="payload.exe",
        )
    return msg.as_bytes()
