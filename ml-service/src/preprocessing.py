# src/preprocessing.py
# ─────────────────────────────────────────────────────────────
# BloodBridge — Feature Preprocessing & Engineering
# ─────────────────────────────────────────────────────────────

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# Features used by the ML ranking model
RANKING_FEATURES = [
    'compatibility_score',
    'availability',
    'reliability_score',
    'response_rate',
    'distance_km',
    'response_time_hours',
    'total_donations',
    'emergency_availability'
]


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Apply feature engineering before scaling.
    Inverts lower-is-better features so all features
    point in the same direction (higher = better).
    """
    df = df.copy()

    # Invert distance: donor 2 km away is better than 50 km
    # Formula: 1 / (1 + distance) keeps range in (0, 1]
    df['distance_km'] = 1 / (1 + df['distance_km'])

    # Invert response time: faster response = higher score
    df['response_time_hours'] = 1 / (1 + df['response_time_hours'])

    # Normalise total donations: cap at 30 (diminishing returns beyond that)
    df['total_donations'] = np.clip(df['total_donations'] / 30, 0, 1)

    return df


def preprocess(df: pd.DataFrame, scaler=None, fit: bool = False):
    """
    Full preprocessing pipeline:
      1. Select ranking features
      2. Engineer features (invert lower-is-better)
      3. Scale all features to [0, 1] using MinMaxScaler

    Parameters:
        df     : DataFrame with ranking features
        scaler : fitted MinMaxScaler (pass None if fit=True)
        fit    : True during training, False during prediction

    Returns:
        X_scaled : numpy array ready for model
        scaler   : fitted scaler (save this with the model)
    """
    df_eng = engineer_features(df)
    X = df_eng[RANKING_FEATURES].copy()

    if fit:
        scaler = MinMaxScaler()
        X_scaled = scaler.fit_transform(X)
    else:
        if scaler is None:
            raise ValueError("Scaler must be provided when fit=False")
        X_scaled = scaler.transform(X)

    return X_scaled, scaler


def get_feature_names() -> list:
    """Returns the list of ranking feature names."""
    return RANKING_FEATURES
