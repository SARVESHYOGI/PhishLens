"""Tests for text preprocessing."""

from data.preprocessing import build_email_text

NEWLINE = chr(10)


def test_build_email_text_formats_and_strips():
    text = build_email_text("  Hi  ", NEWLINE + " Body text " + NEWLINE)
    assert text == "Subject: Hi" + NEWLINE + "Body: Body text"


def test_build_email_text_allows_empty_subject():
    assert build_email_text("", "hello") == "Subject: " + NEWLINE + "Body: hello"
