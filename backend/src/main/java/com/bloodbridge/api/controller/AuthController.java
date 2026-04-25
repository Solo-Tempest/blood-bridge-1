package com.bloodbridge.api.controller;

import com.bloodbridge.api.dto.auth.*;
import com.bloodbridge.api.service.AuthService;
import com.bloodbridge.api.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/donor/register")
    public ResponseEntity<AuthResponse> donorRegister(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/donor/login")
    public ResponseEntity<AuthResponse> donorLogin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/donor/otp/send")
    public ResponseEntity<OtpSendResponse> sendOtp(@Valid @RequestBody OtpSendRequest request) {
        return ResponseEntity.ok(otpService.sendOtp(request.getPhone()));
    }

    @PostMapping("/donor/otp/verify")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(otpService.verifyOtp(request.getPhone(), request.getOtp()));
    }
}
