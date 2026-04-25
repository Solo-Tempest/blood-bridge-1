package com.bloodbridge.api.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OtpSendResponse {
    private String message;
    private String otp;   // returned in response for demo purposes
}
