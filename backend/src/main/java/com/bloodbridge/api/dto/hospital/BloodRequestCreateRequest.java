package com.bloodbridge.api.dto.hospital;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BloodRequestCreateRequest {

    @NotBlank(message = "Blood group is required")
    private String bloodGroup;

    @NotNull @Min(1)
    private Integer units;

    @NotNull @Min(1)
    private Integer donorsNeeded;

    @NotBlank(message = "Urgency level is required")
    private String urgency;

    @NotNull @Min(1)
    private Integer distanceKm;

    @NotBlank(message = "Patient name is required")
    private String patientName;

    private String notes;

    @NotBlank(message = "Primary contact number is required")
    private String contactPhone1;

    private String contactPhone2;
}
