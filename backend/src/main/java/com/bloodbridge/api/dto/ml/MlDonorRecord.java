package com.bloodbridge.api.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MlDonorRecord {

    @JsonProperty("donor_id")
    private String donorId;

    @JsonProperty("age")
    private int age;

    @JsonProperty("gender_M")
    private int genderM;

    @JsonProperty("distance_km")
    private double distanceKm;

    @JsonProperty("days_since_last_donation")
    private int daysSinceLastDonation;

    @JsonProperty("is_new_donor")
    private int isNewDonor;

    @JsonProperty("total_donations")
    private int totalDonations;

    @JsonProperty("blood_match_level")
    private double bloodMatchLevel;

    @JsonProperty("availability_flag")
    private int availabilityFlag;
}
