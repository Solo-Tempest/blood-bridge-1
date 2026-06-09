# src/train.py
# ─────────────────────────────────────────────────────────────
# BloodBridge — Model Training & Evaluation Pipeline
# Model: Linear Regression
# ─────────────────────────────────────────────────────────────

import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Allow imports from src/
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocessing import preprocess, get_feature_names

# ── Paths ────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH   = os.path.join(BASE_DIR, 'data',   'bloodbridge_donors.csv')
MODEL_PATH  = os.path.join(BASE_DIR, 'models', 'linear_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')
PLOTS_DIR   = os.path.join(BASE_DIR, 'models')
os.makedirs(os.path.join(BASE_DIR, 'models'), exist_ok=True)


def load_data():
    """Load dataset and return only eligible donors for training."""
    df = pd.read_csv(DATA_PATH)
    print(f"✅ Dataset loaded: {len(df)} total records")

    # Train ML model ONLY on eligible donors
    # (ineligible donors are filtered before ML runs in production)
    eligible_df = df[df['is_eligible'] == 1].copy()
    print(f"   Eligible donors for training : {len(eligible_df)}")
    print(f"   Ineligible (excluded)        : {len(df) - len(eligible_df)}")
    return eligible_df


def evaluate(model, X_test, y_test, label="Test Set"):
    """Compute and print MAE, RMSE, R² metrics."""
    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2   = r2_score(y_test, y_pred)

    print(f"\n📊 {label} Metrics:")
    print(f"   MAE  : {mae:.4f}  (avg error in priority score)")
    print(f"   RMSE : {rmse:.4f}  (penalises large errors)")
    print(f"   R²   : {r2:.4f}  (variance explained by model)")
    return y_pred, mae, rmse, r2


def plot_actual_vs_predicted(y_test, y_pred):
    """Scatter plot of actual vs predicted priority scores."""
    plt.figure(figsize=(7, 5))
    plt.scatter(y_test, y_pred, alpha=0.4, color='steelblue', s=15)
    plt.plot([0, 1], [0, 1], 'r--', linewidth=1.5, label='Perfect prediction')
    plt.xlabel('Actual Priority Score',    fontsize=12)
    plt.ylabel('Predicted Priority Score', fontsize=12)
    plt.title('Actual vs Predicted — BloodBridge', fontsize=13)
    plt.legend()
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'actual_vs_predicted.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"   📈 Saved: actual_vs_predicted.png")


def plot_residuals(y_test, y_pred):
    """Residual plot — should be random noise around zero."""
    residuals = y_test - y_pred
    plt.figure(figsize=(7, 4))
    plt.scatter(y_pred, residuals, alpha=0.4, color='coral', s=15)
    plt.axhline(0, color='black', linewidth=1, linestyle='--')
    plt.xlabel('Predicted Priority Score', fontsize=12)
    plt.ylabel('Residual (Actual − Predicted)', fontsize=12)
    plt.title('Residual Plot — BloodBridge', fontsize=13)
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'residuals.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"   📈 Saved: residuals.png")


def plot_feature_coefficients(model, feature_names):
    """Bar chart of Linear Regression coefficients."""
    coefs = pd.Series(model.coef_, index=feature_names).sort_values()
    colors = ['#c0392b' if c < 0 else '#2980b9' for c in coefs]
    plt.figure(figsize=(8, 5))
    coefs.plot(kind='barh', color=colors)
    plt.axvline(0, color='black', linewidth=0.8)
    plt.xlabel('Coefficient Value', fontsize=12)
    plt.title('Feature Coefficients (Linear Regression)', fontsize=13)
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'feature_coefficients.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"   📈 Saved: feature_coefficients.png")


def plot_score_distribution(y_test, y_pred):
    """Distribution comparison of actual vs predicted scores."""
    plt.figure(figsize=(7, 4))
    plt.hist(y_test,  bins=30, alpha=0.6, color='steelblue', label='Actual')
    plt.hist(y_pred,  bins=30, alpha=0.6, color='coral',     label='Predicted')
    plt.xlabel('Priority Score', fontsize=12)
    plt.ylabel('Count', fontsize=12)
    plt.title('Score Distribution: Actual vs Predicted', fontsize=13)
    plt.legend()
    plt.tight_layout()
    path = os.path.join(PLOTS_DIR, 'score_distribution.png')
    plt.savefig(path, dpi=150)
    plt.close()
    print(f"   📈 Saved: score_distribution.png")


def run_domain_checks(model, scaler):
    """
    Verify model learned correct medical logic.
    Pass = model behaviour matches domain expectations.
    """
    print("\n🩸 Domain Logic Checks:")

    base = {
        'compatibility_score': 0.80, 'distance_km': 10,
        'availability': 1,           'reliability_score': 0.75,
        'response_rate': 0.80,       'response_time_hours': 5,
        'total_donations': 8,        'emergency_availability': 1
    }

    def score(override):
        d = {**base, **override}
        X, _ = preprocess(pd.DataFrame([d]), scaler=scaler, fit=False)
        return model.predict(X)[0]

    checks = [
        ("Compatibility 1.0 > 0.3",
         score({'compatibility_score': 1.0}) > score({'compatibility_score': 0.3})),
        ("Available > Unavailable",
         score({'availability': 1}) > score({'availability': 0})),
        ("Distance 2 km > 50 km",
         score({'distance_km': 2}) > score({'distance_km': 50})),
        ("Reliability 0.95 > 0.40",
         score({'reliability_score': 0.95}) > score({'reliability_score': 0.40})),
        ("Response rate 0.95 > 0.30",
         score({'response_rate': 0.95}) > score({'response_rate': 0.30})),
        ("Response time 1h > 24h",
         score({'response_time_hours': 1}) > score({'response_time_hours': 24})),
    ]

    all_passed = True
    for name, result in checks:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {status} — {name}")
        if not result:
            all_passed = False

    if all_passed:
        print("\n   ✅ All domain checks passed — model is medically correct!")
    else:
        print("\n   ⚠️  Some domain checks failed — review feature engineering.")


def train():
    print("=" * 55)
    print("  BloodBridge — Linear Regression Training Pipeline")
    print("=" * 55)

    # ── 1. Load data ─────────────────────────────────────────
    df = load_data()
    X_scaled, scaler = preprocess(df, fit=True)
    y = df['priority_score'].values

    # ── 2. Train/test split ──────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.20, random_state=42
    )
    print(f"\n   Train size : {len(X_train)}")
    print(f"   Test size  : {len(X_test)}")

    # ── 3. Train model ───────────────────────────────────────
    print("\n🔧 Training Linear Regression model...")
    model = LinearRegression()
    model.fit(X_train, y_train)
    print("   Model trained successfully.")

    # ── 4. Evaluate ──────────────────────────────────────────
    y_pred, mae, rmse, r2 = evaluate(model, X_test, y_test)

    # ── 5. Cross validation ──────────────────────────────────
    cv_scores = cross_val_score(model, X_scaled, y, cv=5, scoring='r2')
    print(f"\n🔁 5-Fold Cross Validation R² Scores:")
    print(f"   Scores : {cv_scores.round(4)}")
    print(f"   Mean   : {cv_scores.mean():.4f}")
    print(f"   Std Dev: {cv_scores.std():.4f}  (lower = more consistent)")

    # ── 6. Coefficients ──────────────────────────────────────
    feature_names = get_feature_names()
    print(f"\n📐 Learned Coefficients vs Original Weights:")
    original_weights = {
        'compatibility_score':  0.30,
        'availability':         0.20,
        'reliability_score':    0.15,
        'response_rate':        0.12,
        'distance_km':          0.10,
        'response_time_hours':  0.08,
        'total_donations':      0.05,
        'emergency_availability': 0.00
    }
    print(f"   {'Feature':<25} {'Coeff':>8}  {'OrigWeight':>10}")
    print(f"   {'-'*45}")
    for name, coef in zip(feature_names, model.coef_):
        orig = original_weights.get(name, 0.0)
        print(f"   {name:<25} {coef:>8.4f}  {orig:>10.2f}")

    # ── 7. Plots ─────────────────────────────────────────────
    print("\n📊 Generating evaluation plots...")
    plot_actual_vs_predicted(y_test, y_pred)
    plot_residuals(y_test, y_pred)
    plot_feature_coefficients(model, feature_names)
    plot_score_distribution(y_test, y_pred)

    # ── 8. Domain checks ─────────────────────────────────────
    run_domain_checks(model, scaler)

    # ── 9. Save model and scaler ─────────────────────────────
    joblib.dump(model,  MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    print(f"\n💾 Model saved  → {MODEL_PATH}")
    print(f"   Scaler saved → {SCALER_PATH}")
    print("\n" + "=" * 55)
    print("  Training Complete!")
    print("=" * 55)

    return model, scaler


if __name__ == "__main__":
    train()
