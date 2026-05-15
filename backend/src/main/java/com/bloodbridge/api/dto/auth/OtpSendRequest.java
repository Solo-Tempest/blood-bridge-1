package com.bloodbridge.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpSendRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address")
    private String email;
}
