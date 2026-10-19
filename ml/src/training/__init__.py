"""Model fitting and evaluation entry points.

The current baseline is trained in ``notebooks``/``models/ml.ipynb``. Move
that logic into this package when you retrain on analyzer-generated
features so training and serving share one code path.
"""

from data.preprocessing import build_email_text

__all__ = ["build_email_text"]
