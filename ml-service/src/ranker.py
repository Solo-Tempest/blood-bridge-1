# src/ranker.py
# ─────────────────────────────────────────────────────────────
# BloodBridge — Donor Ranking Engine
# Step 1: Filter by WHO/NACO eligibility rules
# Step 2: Rank eligible donors using Linear Regression
# ─────────────────────────────────────────────────────────────

import os
import sys
import joblib
import pandas as pd

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from eligibility   import check_eligibility
from preprocessing import preprocess

# ── Load saved model and scaler ──────────────────────────────
BASE_DIR    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH  = os.path.join(BASE_DIR, 'models', 'linear_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'models', 'scaler.pkl')

model  = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)


def rank_donors(donors: list) -> dict:
    """
    Full donor ranking pipeline.

    Parameters:
        donors (list[dict]): Raw donor records with all fields

    Returns:
        dict: {
            ranked_donors       : list of eligible donors sorted by priority,
            total_submitted     : int,
            total_eligible      : int,
            total_ineligible    : int,
            ineligible_details  : list of dicts with donor_id + reasons
        }
    """

    eligible_donors   = []
    ineligible_donors = []

    # ── STEP 1: Rule-based eligibility filter ────────────────
    for donor in donors:
        result = check_eligibility(donor)
        if result['eligible']:
            eligible_donors.append(donor)
        else:
            ineligible_donors.append({
                'donor_id': donor.get('donor_id', 'Unknown'),
                'reasons' : result['reasons']
            })

    if not eligible_donors:
        return {
            "ranked_donors"    : [],
            "total_submitted"  : len(donors),
            "total_eligible"   : 0,
            "total_ineligible" : len(ineligible_donors),
            "ineligible_details": ineligible_donors,
            "message"          : "No eligible donors found."
        }

    # ── STEP 2: Preprocess ranking features ──────────────────
    df = pd.DataFrame(eligible_donors)
    X_scaled, _ = preprocess(df, scaler=scaler, fit=False)

    # ── STEP 3: Predict priority scores ──────────────────────
    scores = model.predict(X_scaled)

    # Attach predicted score to each eligible donor
    for i, donor in enumerate(eligible_donors):
        donor['predicted_priority'] = round(float(scores[i]), 4)

    # ── STEP 4: Sort descending by priority score ─────────────
    ranked = sorted(
        eligible_donors,
        key=lambda x: x['predicted_priority'],
        reverse=True
    )

    # Add rank position
    for rank, donor in enumerate(ranked, start=1):
        donor['rank'] = rank

    return {
        "ranked_donors"     : ranked,
        "total_submitted"   : len(donors),
        "total_eligible"    : len(eligible_donors),
        "total_ineligible"  : len(ineligible_donors),
        "ineligible_details": ineligible_donors
    }
