package com.bloodbridge.api.dto.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class HospitalRegisterRequest {

    @NotBlank(message = "Hospital name is required")
    private String name;

    @NotBlank(message = "Registration number is required")
    private String regNo;

    private String type;
    private Integer year;
    private String website;

    // Address
    private String street;
    private String area;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Pincode is required")
    private String pincode;

    private String landmark;
    private String lat;
    private String lng;

    // Contact
    @NotBlank(message = "Contact person name is required")
    private String contactName;

    private String contactRole;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid Indian phone number")
    private String phone;

    private String altPhone;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    // Facilities
    private boolean hasBloodBank;
    private String bbLicense;
    private boolean open24x7;
    private String openTime;
    private String closeTime;
    private Integer beds;
    private Integer icuBeds;

    // Account
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;
}
