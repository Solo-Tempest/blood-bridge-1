package com.bloodbridge.api.dto.ml;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MlRankRequest {

    @JsonProperty("urgency")
    private String urgency;

    @JsonProperty("donors")
    private List<MlDonorRecord> donors;
}
