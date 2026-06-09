package com.bloodbridge.api.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class MlRankResponse {

    @JsonProperty("ranked_donors")
    private List<MlRankedDonor> rankedDonors;

    @JsonProperty("total_donors")
    private int totalDonors;
}
