from email import policy
from email.message import EmailMessage
from email.parser import BytesParser


class EmlParseError(ValueError):
    pass


def extract_subject_and_body(raw: bytes) -> tuple[str, str]:
    message = BytesParser(policy=policy.default).parsebytes(raw)
    subject = str(message.get("subject", ""))
    body = _find_plain_text_body(message)
    if body is None:
        raise EmlParseError(
            "No plain-text body found. HTML-only emails are not supported yet."
        )
    return subject, body


def _find_plain_text_body(message: EmailMessage) -> str | None:
    for part in message.walk():
        if part.is_multipart() or part.is_attachment():
            continue
        if part.get_content_type() != "text/plain":
            continue
        try:
            return part.get_content()
        except (LookupError, UnicodeDecodeError, ValueError):
            raise EmlParseError("Could not decode the plain-text body.") from None
    return None
