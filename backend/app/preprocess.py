def build_email_text(subject: str, body: str) -> str:
    return f"Subject: {subject.strip()}\nBody: {body.strip()}"
