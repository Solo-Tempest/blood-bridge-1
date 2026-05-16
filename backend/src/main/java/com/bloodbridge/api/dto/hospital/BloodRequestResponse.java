package com.bloodbridge.api.dto.hospital;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String contactPhone1;
    private String contactPhone2;
    private String status;
    private Integer sent;
    private Integer accepted;
    private Integer declined;
    private Integer pending;
    private Integer escalationLevel;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}
