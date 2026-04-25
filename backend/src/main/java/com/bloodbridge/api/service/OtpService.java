package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.auth.AuthResponse;
import com.bloodbridge.api.dto.auth.OtpSendResponse;
import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.entity.enums.Role;
import com.bloodbridge.api.exception.ApiException;
import com.bloodbridge.api.repository.DonorRepository;
import com.bloodbridge.api.repository.HospitalRepository;
import com.bloodbridge.api.repository.UserRepository;
import com.bloodbridge.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final HospitalRepository hospitalRepository;
    private final JwtUtil jwtUtil;

    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public OtpSendResponse sendOtp(String phone) {
        userRepository.findByPhone(phone)
                .orElseThrow(() -> new ApiException("Phone number not registered", HttpStatus.NOT_FOUND));

        String otp = String.format("%06d", random.nextInt(1_000_000));
        otpStore.put(phone, new OtpEntry(otp, LocalDateTime.now().plusMinutes(5)));

        return OtpSendResponse.builder()
                .message("OTP sent successfully")
                .otp(otp)
                .build();
    }

    public AuthResponse verifyOtp(String phone, String otp) {
        OtpEntry entry = otpStore.get(phone);

        if (entry == null) {
            throw new ApiException("OTP not requested or expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }
        if (entry.isExpired()) {
            otpStore.remove(phone);
            throw new ApiException("OTP has expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }
        if (!entry.otp().equals(otp)) {
            throw new ApiException("Invalid OTP. Please try again.", HttpStatus.BAD_REQUEST);
        }

        otpStore.remove(phone);

        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        String token = jwtUtil.generateToken(user);

        String fullName;
        if (user.getRole() == Role.HOSPITAL) {
            fullName = hospitalRepository.findByUser(user).map(Hospital::getName).orElse(null);
        } else {
            fullName = donorRepository.findByUser(user).map(Donor::getFullName).orElse(null);
        }

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(fullName)
                .build();
    }

    private record OtpEntry(String otp, LocalDateTime expiresAt) {
        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }
}
