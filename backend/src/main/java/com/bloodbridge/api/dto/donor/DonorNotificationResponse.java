package com.bloodbridge.api.dto.donor;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DonorNotificationResponse {
    private Long id;
    private Long bloodRequestId;
    private String bloodGroup;
    private String urgency;
    private String status;
    private Integer units;
    private Integer donorsNeeded;
    private String notes;
    private Double distanceKm;

    // Always revealed
    private String hospitalCity;

    // Approximate coords for PENDING (2 dp ≈ 1 km accuracy) — for map preview circle
    private Double hospitalLatApprox;
    private Double hospitalLngApprox;

    // Exact — only after ACCEPTED
    private String hospitalName;
    private Double hospitalLat;
    private Double hospitalLng;
    private String hospitalStreet;
    private String hospitalArea;
    private String contactPhone1;
    private String contactPhone2;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime sentAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime respondedAt;
}
