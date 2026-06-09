package com.bloodbridge.api.dto.hospital;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RequestDonorResponse {
    private Long notificationId;
    private String name;
    private String bloodGroup;
    private String gender;
    private String city;
    private String state;
    private Double distanceKm;
    private String status;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime sentAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime respondedAt;

    // ML ranking score — always visible so hospital can see ranking proof
    private Double mlScore;

    // Revealed only for ACCEPTED donors
    private String phone;
    private Double weight;
    private LocalDate dateOfBirth;
    private LocalDate lastDonationDate;
    private Integer totalDonations;
    private Double latitude;
    private Double longitude;
}
