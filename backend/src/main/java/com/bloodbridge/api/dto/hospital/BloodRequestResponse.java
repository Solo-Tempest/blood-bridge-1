package com.bloodbridge.api.dto.hospital;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BloodRequestResponse {
    private Long id;
    private String bloodGroup;
    private Integer units;
    private Integer donorsNeeded;
    private String urgency;
    private Integer distanceKm;
    private String patientName;
    private String notes;
    private String status;
    private Integer sent;
    private Integer accepted;
    private Integer declined;
    private Integer pending;
    private Integer escalationLevel;
    private LocalDateTime createdAt;
}
