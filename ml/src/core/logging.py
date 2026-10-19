"""Logging configuration."""

import logging
import sys


def configure_logging(level: str = "INFO") -> None:
    """Configure the root logger once for the whole process."""
    logging.basicConfig(
        level=level.upper(),
        format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
        stream=sys.stdout,
    )
