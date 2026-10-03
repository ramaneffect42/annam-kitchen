from pathlib import Path

import joblib
import numpy as np
from flask import current_app

from app.ml.features import describe, feature_group, to_feature_dict
from app.ml.train import model_path, train

MAX_REASONS = 3

_cache: dict = {}


def ensure_model(database_path: str):
    """Train a model on first run so the API works without a manual step."""
    if not model_path(database_path).exists():
        train(database_path, verbose=False)


def _load() -> dict:
    path: Path = model_path(current_app.config["DATABASE"])
    mtime = path.stat().st_mtime
    if _cache.get("mtime") != mtime:  # reload after retraining
        _cache.update(joblib.load(path), mtime=mtime)
    return _cache


def predict(profile: dict) -> dict:
    """Predict plan probabilities and the top reasons behind the best plan."""
    model = _load()
    pipeline = model["pipeline"]
    features = to_feature_dict(profile)

    probabilities = pipeline.predict_proba([features])[0]
    classes = list(pipeline.classes_)
    best = int(np.argmax(probabilities))

    # Logistic regression is linear in the scaled features, so each column's
    # push toward a plan is coef * value. Compare the chosen plan against the
    # average of the others and sum columns back into the user's inputs.
    vectorizer = pipeline.named_steps["vectorize"]
    z = pipeline.named_steps["scale"].transform(vectorizer.transform([features]))[0]
    coef = pipeline.named_steps["classify"].coef_
    contributions = coef * z
    relative = contributions[best] - np.delete(contributions, best, axis=0).mean(axis=0)

    by_group: dict[str, float] = {}
    for column, value in zip(vectorizer.get_feature_names_out(), relative):
        group = feature_group(column)
        by_group[group] = by_group.get(group, 0.0) + float(value)

    top = sorted((g for g, v in by_group.items() if v > 0), key=lambda g: by_group[g], reverse=True)
    reasons = [{"feature": g, "text": describe(g, profile), "impact": round(by_group[g], 3)} for g in top[:MAX_REASONS]]

    return {
        "plan": classes[best],
        "confidence": round(float(probabilities[best]), 4),
        "probabilities": {plan: round(float(p), 4) for plan, p in zip(classes, probabilities)},
        "reasons": reasons,
        "model": {
            "version": model["metadata"]["version"],
            "trained_at": model["metadata"]["trained_at"],
            "real_samples": model["metadata"]["real_samples"],
        },
    }
