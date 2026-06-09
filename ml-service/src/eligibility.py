# src/eligibility.py
# ─────────────────────────────────────────────────────────────
# BloodBridge — Rule-Based Donor Eligibility Checker
# Rules sourced from WHO Blood Donor Selection Guidelines
# and NACO (National AIDS Control Organisation) India norms
# ─────────────────────────────────────────────────────────────

def check_eligibility(donor: dict) -> dict:
    """
    Checks whether a donor is eligible to donate blood
    based on WHO/NACO standard rules.

    Parameters:
        donor (dict): Donor data with eligibility fields

    Returns:
        dict: { eligible: bool, reasons: list[str] }
    """
    reasons = []

    # ── Rule 1: Age (WHO: 18–65 years) ──────────────────────
    if not (18 <= donor['age'] <= 65):
        reasons.append(
            f"Age {donor['age']} is out of range. Must be 18–65 years."
        )

    # ── Rule 2: Weight (WHO: minimum 45 kg) ─────────────────
    if donor['weight_kg'] < 45:
        reasons.append(
            f"Weight {donor['weight_kg']} kg is below minimum (45 kg)."
        )

    # ── Rule 3: Hemoglobin (gender-specific WHO norms) ───────
    min_hb = 12.5 if donor['gender'] == 'F' else 13.5
    if donor['hemoglobin_gdl'] < min_hb:
        reasons.append(
            f"Hemoglobin {donor['hemoglobin_gdl']} g/dL is below minimum "
            f"({min_hb} g/dL for {'female' if donor['gender']=='F' else 'male'})."
        )

    # ── Rule 4: Donation interval (WHO: 56 days for whole blood) ─
    if donor['last_donation_days'] < 56:
        days_left = 56 - donor['last_donation_days']
        reasons.append(
            f"Too soon since last donation. Must wait {days_left} more days "
            f"(minimum 56-day gap required)."
        )

    # ── Rule 5: Blood pressure ───────────────────────────────
    if not (90 <= donor['systolic_bp'] <= 180):
        reasons.append(
            f"Systolic BP {donor['systolic_bp']} mmHg is out of safe range (90–180)."
        )
    if not (60 <= donor['diastolic_bp'] <= 100):
        reasons.append(
            f"Diastolic BP {donor['diastolic_bp']} mmHg is out of safe range (60–100)."
        )

    # ── Rule 6: Pregnancy ────────────────────────────────────
    if donor.get('is_pregnant', 0):
        reasons.append(
            "Pregnant donors are not eligible to donate blood."
        )

    # ── Rule 7: Recent illness ───────────────────────────────
    if donor.get('recent_illness', 0):
        reasons.append(
            "Donor has had a recent illness. Must be fully recovered for at least 14 days."
        )

    # ── Rule 8: Recent surgery ───────────────────────────────
    if donor.get('recent_surgery', 0):
        reasons.append(
            "Donor has had recent surgery. Must wait at least 6 months post-surgery."
        )

    # ── Rule 9: Tattoo or piercing ───────────────────────────
    if donor.get('tattoo_piercing', 0):
        reasons.append(
            "Tattoo or piercing within last 12 months. Deferral required (infection risk)."
        )

    # ── Rule 10: Chronic disease ─────────────────────────────
    if donor.get('chronic_disease', 0):
        reasons.append(
            "Donor has a chronic disease (HIV/Hepatitis/Diabetes etc.). Permanently deferred."
        )

    return {
        "eligible": len(reasons) == 0,
        "total_rules_checked": 10,
        "rules_failed": len(reasons),
        "reasons": reasons
    }
