package com.bloodbridge.api.dto.donor;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DonorProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String bloodGroup;
    private String gender;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    private Double weight;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate lastDonationDate;

    private String city;
    private String state;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private boolean available;
    private int totalDonations;
}
