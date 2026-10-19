"""Text normalization shared by training and serving.

Both paths must produce byte-identical strings, otherwise a model fitted on
one format is scored against another.
"""

NEWLINE = chr(10)


def build_email_text(subject: str, body: str) -> str:
    """Combine a subject and body into the format the baseline expects."""
    return "Subject: " + subject.strip() + NEWLINE + "Body: " + body.strip()
