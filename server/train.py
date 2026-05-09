"""
HireStreamAI — Model Training Script
======================================
Trains an XGBoost ATS score predictor on synthetic/real labelled data.

Features used:
  - Skill match ratio
  - Semantic similarity score
  - Experience ratio
  - Education level score
  - Keyword density score

Labels: ATS score 0–100 (regression) or hire/no-hire (classification)

Usage:
    python scripts/train.py --output models/ats_model.pkl
"""

import argparse
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor
from loguru import logger


# ── Synthetic Training Data Generator ─────────────────────────────────────────
def generate_synthetic_data(n_samples: int = 2000) -> pd.DataFrame:
    """
    Generate synthetic ATS feature-label pairs for training.
    In production, replace this with real recruiter-labelled data.
    """
    np.random.seed(42)
    data = {
        "skill_match_ratio":    np.random.beta(3, 2, n_samples),
        "semantic_similarity":  np.random.beta(2.5, 2, n_samples),
        "experience_ratio":     np.clip(np.random.normal(0.8, 0.3, n_samples), 0, 1),
        "education_score":      np.random.choice([0.4, 0.5, 0.65, 0.70, 0.85, 1.0], n_samples),
        "keyword_density":      np.random.beta(2, 3, n_samples),
    }
    df = pd.DataFrame(data)

    # Generate ATS score as weighted combination + noise (simulates recruiter judgement)
    df["ats_score"] = (
        df["skill_match_ratio"]   * 35
        + df["semantic_similarity"] * 30
        + df["experience_ratio"]    * 20
        + df["education_score"]     * 10
        + df["keyword_density"]     *  5
        + np.random.normal(0, 2, n_samples)  # recruiter noise
    ).clip(0, 100)

    return df


def train(output_path: str, n_samples: int = 2000):
    logger.info("Generating synthetic training data...")
    df = generate_synthetic_data(n_samples)

    FEATURES = [
        "skill_match_ratio", "semantic_similarity",
        "experience_ratio", "education_score", "keyword_density"
    ]
    X = df[FEATURES]
    y = df["ats_score"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    logger.info(f"Training XGBoost regressor on {len(X_train)} samples...")
    model = XGBRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    # ── Evaluation ────────────────────────────────────────────────────────
    preds = model.predict(X_test)
    mae  = mean_absolute_error(y_test, preds)
    r2   = r2_score(y_test, preds)

    logger.info(f"MAE:  {mae:.2f} (ATS score points)")
    logger.info(f"R²:   {r2:.4f}")

    cv_scores = cross_val_score(model, X, y, cv=5, scoring="neg_mean_absolute_error")
    logger.info(f"5-Fold CV MAE: {-cv_scores.mean():.2f} ± {cv_scores.std():.2f}")

    # ── Feature Importance ────────────────────────────────────────────────
    importance = pd.Series(model.feature_importances_, index=FEATURES).sort_values(ascending=False)
    logger.info("Feature Importance:\n" + importance.to_string())

    # ── Save Model ────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    joblib.dump({"model": model, "features": FEATURES}, output_path)
    logger.info(f"Model saved to: {output_path}")

    return {"mae": mae, "r2": r2, "output": output_path}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train HireStreamAI ATS model")
    parser.add_argument("--output",   default="models/ats_model.pkl", help="Output path for saved model")
    parser.add_argument("--samples",  type=int, default=2000,         help="Number of synthetic training samples")
    args = parser.parse_args()
    train(args.output, args.samples)
