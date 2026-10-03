"""Train the plan-recommendation model.

Usage (from backend/):
    python -m app.ml.train            # train and save to instance/ml/
    python -m app.ml.train --samples 50000

Training data = synthetic profiles (see synthetic.py) + real choices users
made on the /plan-finder page (plan_predictions.chosen_plan), which are
up-weighted so they gradually override the synthetic assumptions.
"""

import argparse
import json
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.feature_extraction import DictVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, log_loss
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.config import Config
from app.ml import synthetic
from app.ml.features import PLANS, ValidationError, to_feature_dict, validate

MODEL_VERSION = "1"
REAL_SAMPLE_WEIGHT = 5.0


def model_path(database_path: str) -> Path:
    return Path(database_path).parent / "ml" / "plan_model.joblib"


def load_real_choices(database_path: str):
    """Profiles and chosen plans recorded by the /plan-finder page."""
    if not Path(database_path).exists():
        return [], []
    with closing(sqlite3.connect(database_path)) as conn:
        try:
            rows = conn.execute(
                "SELECT profile_json, chosen_plan FROM plan_predictions WHERE chosen_plan IS NOT NULL"
            ).fetchall()
        except sqlite3.OperationalError:  # table not created yet
            return [], []
    profiles, labels = [], []
    for profile_json, chosen_plan in rows:
        try:
            profiles.append(validate(json.loads(profile_json)))
            labels.append(chosen_plan)
        except (ValidationError, json.JSONDecodeError):
            continue
    return profiles, labels


def build_pipeline() -> Pipeline:
    return Pipeline([
        ("vectorize", DictVectorizer(sparse=False)),
        ("scale", StandardScaler()),
        ("classify", LogisticRegression(C=1.0, max_iter=2000)),
    ])


def train(database_path: str = Config.DATABASE, samples: int = 20000, seed: int = 42, verbose: bool = True) -> dict:
    profiles, labels, ideal = synthetic.generate(samples, seed=seed)
    real_profiles, real_labels = load_real_choices(database_path)

    X = [to_feature_dict(p) for p in profiles]
    y = np.array(labels)
    idx_train, idx_test = train_test_split(
        np.arange(len(X)), test_size=0.2, random_state=seed, stratify=y
    )
    X_train = [X[i] for i in idx_train] + [to_feature_dict(p) for p in real_profiles]
    y_train = np.concatenate([y[idx_train], np.array(real_labels, dtype=y.dtype)])
    weights = np.concatenate([np.ones(len(idx_train)), np.full(len(real_labels), REAL_SAMPLE_WEIGHT)])
    X_test, y_test = [X[i] for i in idx_test], y[idx_test]

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train, classify__sample_weight=weights)
    proba = pipeline.predict_proba(X_test)

    # Reference points for judging the model on the synthetic hold-out set.
    baseline = DummyClassifier(strategy="most_frequent").fit(X_train, y_train)
    boosted = Pipeline([
        ("vectorize", DictVectorizer(sparse=False)),
        ("classify", HistGradientBoostingClassifier(random_state=seed)),
    ]).fit(X_train, y_train)

    metrics = {
        "accuracy": round(accuracy_score(y_test, pipeline.predict(X_test)), 4),
        "log_loss": round(log_loss(y_test, proba, labels=pipeline.classes_), 4),
        "baseline_accuracy": round(accuracy_score(y_test, baseline.predict(X_test)), 4),
        "gradient_boosting_accuracy": round(accuracy_score(y_test, boosted.predict(X_test)), 4),
        # Best achievable: always predicting the noise-free preferred plan.
        "ceiling_accuracy": round(accuracy_score(y_test, np.array(ideal)[idx_test]), 4),
    }
    metadata = {
        "version": MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "algorithm": "multinomial logistic regression",
        "synthetic_samples": samples,
        "real_samples": len(real_labels),
        "class_distribution": {plan: int((y_train == plan).sum()) for plan in PLANS},
        "metrics": metrics,
    }

    path = model_path(database_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline, "metadata": metadata}, path)

    if verbose:
        print(json.dumps(metadata, indent=2))
        print(f"Saved model to {path}")
    return metadata


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--samples", type=int, default=20000)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    train(samples=args.samples, seed=args.seed)
