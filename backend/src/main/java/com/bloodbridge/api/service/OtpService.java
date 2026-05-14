package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.auth.AuthResponse;
import com.bloodbridge.api.dto.auth.OtpSendResponse;
import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.OtpRecord;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.entity.enums.Role;
import com.bloodbridge.api.exception.ApiException;
import com.bloodbridge.api.repository.DonorRepository;
import com.bloodbridge.api.repository.HospitalRepository;
import com.bloodbridge.api.repository.OtpRecordRepository;
import com.bloodbridge.api.repository.UserRepository;
import com.bloodbridge.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final UserRepository        userRepository;
    private final DonorRepository       donorRepository;
    private final HospitalRepository    hospitalRepository;
    private final OtpRecordRepository   otpRecordRepository;
    private final JwtUtil               jwtUtil;
    private final SmsService            smsService;

    @Value("${otp.expiry-minutes:5}")
    private int expiryMinutes;

    @Value("${otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${otp.rate-limit.max-requests:3}")
    private int maxRequests;

    @Value("${otp.rate-limit.window-minutes:10}")
    private int windowMinutes;

    private final SecureRandom random = new SecureRandom();

    @Transactional
    public OtpSendResponse sendOtp(String phone) {
        userRepository.findByPhone(phone)
                .orElseThrow(() -> new ApiException("Phone number not registered", HttpStatus.NOT_FOUND));

        // Rate limiting — max N sends per phone in rolling window
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(windowMinutes);
        long recentCount = otpRecordRepository.countByPhoneNumberAndCreatedAtAfter(phone, windowStart);
        if (recentCount >= maxRequests) {
            throw new ApiException(
                    "Too many OTP requests. Please wait " + windowMinutes + " minutes before trying again.",
                    HttpStatus.TOO_MANY_REQUESTS);
        }

        // Invalidate any existing unused OTPs for this phone
        otpRecordRepository.invalidateAllByPhoneNumber(phone);

        // Generate and persist new OTP
        String otp = String.format("%06d", random.nextInt(1_000_000));
        LocalDateTime now = LocalDateTime.now();

        otpRecordRepository.save(OtpRecord.builder()
                .phoneNumber(phone)
                .otpCode(otp)
                .expiryTime(now.plusMinutes(expiryMinutes))
                .attempts(0)
                .used(false)
                .createdAt(now)
                .build());

        // Send via SMS (dev → console, prod → Twilio)
        smsService.sendOtp(phone, otp);

        return OtpSendResponse.builder()
                .message("OTP sent successfully")
                // Only include OTP in the response body during dev mode
                .otp(smsService.isDevMode() ? otp : null)
                .build();
    }

    @Transactional
    public AuthResponse loginByVerifiedPhone(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ApiException("Phone number not registered", HttpStatus.NOT_FOUND));

        String token = jwtUtil.generateToken(user);

        String fullName = (user.getRole() == Role.HOSPITAL)
                ? hospitalRepository.findByUser(user).map(Hospital::getName).orElse(null)
                : donorRepository.findByUser(user).map(Donor::getFullName).orElse(null);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(String phone, String otp) {
        OtpRecord record = otpRecordRepository
                .findTopByPhoneNumberAndUsedFalseOrderByCreatedAtDesc(phone)
                .orElseThrow(() -> new ApiException(
                        "No active OTP found for this number. Please request a new one.",
                        HttpStatus.BAD_REQUEST));

        if (record.isExpired()) {
            record.setUsed(true);
            otpRecordRepository.save(record);
            throw new ApiException("OTP has expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }

        if (record.getAttempts() >= maxAttempts) {
            throw new ApiException(
                    "Too many failed attempts. Please request a new OTP.", HttpStatus.BAD_REQUEST);
        }

        if (!record.getOtpCode().equals(otp)) {
            record.setAttempts(record.getAttempts() + 1);
            otpRecordRepository.save(record);
            int remaining = maxAttempts - record.getAttempts();
            throw new ApiException(
                    "Invalid OTP. " + remaining + " attempt(s) remaining.", HttpStatus.BAD_REQUEST);
        }

        // Success — expire this OTP immediately
        record.setUsed(true);
        otpRecordRepository.save(record);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        String token = jwtUtil.generateToken(user);

        String fullName = (user.getRole() == Role.HOSPITAL)
                ? hospitalRepository.findByUser(user).map(Hospital::getName).orElse(null)
                : donorRepository.findByUser(user).map(Donor::getFullName).orElse(null);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .build();
    }
}
