package com.bloodbridge.api.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class MlRankedDonor {

    @JsonProperty("donor_id")
    private String donorId;

    @JsonProperty("rank")
    private int rank;

    @JsonProperty("p_show_up")
    private double pShowUp;

    @JsonProperty("blood_match_level")
    private double bloodMatchLevel;

    @JsonProperty("closeness")
    private double closeness;

    @JsonProperty("final_score")
    private double finalScore;
}
