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

    /* ── Donor ── */

    @PostMapping("/donor/register")
    public ResponseEntity<AuthResponse> donorRegister(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/donor/login")
    public ResponseEntity<AuthResponse> donorLogin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/donor/otp/send")
    public ResponseEntity<OtpSendResponse> donorSendOtp(@Valid @RequestBody OtpSendRequest request) {
        return ResponseEntity.ok(otpService.sendOtp(request.getPhone()));
    }

    @PostMapping("/donor/otp/verify")
    public ResponseEntity<AuthResponse> donorVerifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(otpService.verifyOtp(request.getPhone(), request.getOtp()));
    }

    // Called after Firebase Phone Auth confirms OTP client-side
    @PostMapping("/donor/phone/verified")
    public ResponseEntity<AuthResponse> donorPhoneVerified(@Valid @RequestBody OtpSendRequest request) {
        return ResponseEntity.ok(otpService.loginByVerifiedPhone(request.getPhone()));
    }

    /* ── Hospital ── */

    @PostMapping("/hospital/register")
    public ResponseEntity<AuthResponse> hospitalRegister(@Valid @RequestBody HospitalRegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.hospitalRegister(request));
    }

    @PostMapping("/hospital/login")
    public ResponseEntity<AuthResponse> hospitalLogin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/hospital/otp/send")
    public ResponseEntity<OtpSendResponse> hospitalSendOtp(@Valid @RequestBody OtpSendRequest request) {
        return ResponseEntity.ok(otpService.sendOtp(request.getPhone()));
    }

    @PostMapping("/hospital/otp/verify")
    public ResponseEntity<AuthResponse> hospitalVerifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(otpService.verifyOtp(request.getPhone(), request.getOtp()));
    }

    // Called after Firebase Phone Auth confirms OTP client-side
    @PostMapping("/hospital/phone/verified")
    public ResponseEntity<AuthResponse> hospitalPhoneVerified(@Valid @RequestBody OtpSendRequest request) {
        return ResponseEntity.ok(otpService.loginByVerifiedPhone(request.getPhone()));
    }
}
