from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import joblib
import json
import numpy as np
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "showup_model.pkl")
SCHEMA_PATH = os.path.join(BASE_DIR, "models", "showup_schema.json")

model = joblib.load(MODEL_PATH)
with open(SCHEMA_PATH) as f:
    schema = json.load(f)
FEATURES = schema["features"]

# Closeness decay by urgency: higher = prefer closer donors more strongly
URGENCY_DECAY = {"NORMAL": 0.15, "URGENT": 0.25, "CRITICAL": 0.40}

app = FastAPI(title="BloodBridge ML Ranking Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class DonorInput(BaseModel):
    donor_id: str
    age: int
    gender_M: int              # 1 = male, 0 = female/other
    distance_km: float
    days_since_last_donation: int  # 999 if never donated
    is_new_donor: int          # 1 if total_donations == 0
    total_donations: int
    blood_match_level: float   # 0.7–1.0: how close the blood type match is
    availability_flag: int = 1


class RankRequest(BaseModel):
    urgency: str               # NORMAL, URGENT, CRITICAL
    donors: List[DonorInput]


class RankedDonor(BaseModel):
    donor_id: str
    rank: int
    p_show_up: float
    blood_match_level: float
    closeness: float
    final_score: float


class RankResponse(BaseModel):
    ranked_donors: List[RankedDonor]
    total_donors: int
    model_info: dict


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": schema.get("best_model"),
        "auc": schema.get("auc"),
    }


@app.post("/rank-donors", response_model=RankResponse)
def rank_donors(req: RankRequest):
    urgency = req.urgency.upper()
    decay = URGENCY_DECAY.get(urgency, 0.25)

    now = datetime.now()
    hour = now.hour
    dow = now.weekday()   # 0=Monday … 6=Sunday
    is_weekend = 1 if dow >= 5 else 0
    is_evening = 1 if 18 <= hour <= 22 else 0

    results = []
    for d in req.donors:
        row = {
            "donor_age": d.age,
            "donor_gender_M": d.gender_M,
            "distance_km": d.distance_km,
            "days_since_last_donation": d.days_since_last_donation,
            "is_new_donor": d.is_new_donor,
            "total_past_donations": d.total_donations,
            "blood_match_level": d.blood_match_level,
            "availability_flag": d.availability_flag,
            "urgency_NORMAL": 1 if urgency == "NORMAL" else 0,
            "urgency_URGENT": 1 if urgency == "URGENT" else 0,
            "urgency_CRITICAL": 1 if urgency == "CRITICAL" else 0,
            "hour_of_day": hour,
            "day_of_week": dow,
            "is_weekend": is_weekend,
            "is_evening": is_evening,
        }
        X = np.array([[row[f] for f in FEATURES]])
        p_show_up = float(model.predict_proba(X)[0][1])
        closeness = 1.0 / (1.0 + d.distance_km * decay)
        final_score = d.blood_match_level * p_show_up * d.availability_flag * closeness

        results.append({
            "donor_id": d.donor_id,
            "p_show_up": round(p_show_up, 4),
            "blood_match_level": d.blood_match_level,
            "closeness": round(closeness, 4),
            "final_score": round(final_score, 4),
        })

    results.sort(key=lambda x: x["final_score"], reverse=True)
    ranked = [RankedDonor(**{**r, "rank": i + 1}) for i, r in enumerate(results)]

    return RankResponse(
        ranked_donors=ranked,
        total_donors=len(ranked),
        model_info={"model": schema.get("best_model"), "auc": schema.get("auc")},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
