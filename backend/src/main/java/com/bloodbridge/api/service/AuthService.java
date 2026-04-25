package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.auth.AuthResponse;
import com.bloodbridge.api.dto.auth.HospitalRegisterRequest;
import com.bloodbridge.api.dto.auth.LoginRequest;
import com.bloodbridge.api.dto.auth.RegisterRequest;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new ApiException("Phone number already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.DONOR)
                .enabled(true)
                .verified(false)
                .build();

        userRepository.save(user);

        Donor donor = Donor.builder()
                .user(user)
                .fullName(request.getFullName())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .bloodGroup(request.getBloodGroup())
                .weight(request.getWeight())
                .lastDonationDate(request.getLastDonationDate())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .available(true)
                .build();

        donorRepository.save(donor);

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(donor.getFullName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getIdentifier())
                .or(() -> userRepository.findByPhone(request.getIdentifier()))
                .orElseThrow(() -> new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new ApiException("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }

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

    @Transactional
    public AuthResponse hospitalRegister(HospitalRegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ApiException("Email already registered", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByPhone(req.getPhone())) {
            throw new ApiException("Phone number already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.HOSPITAL)
                .enabled(true)
                .verified(false)
                .build();

        userRepository.save(user);

        Hospital hospital = Hospital.builder()
                .user(user)
                .name(req.getName())
                .regNo(req.getRegNo())
                .type(req.getType())
                .year(req.getYear())
                .website(req.getWebsite())
                .street(req.getStreet())
                .area(req.getArea())
                .city(req.getCity())
                .state(req.getState())
                .pincode(req.getPincode())
                .landmark(req.getLandmark())
                .lat(req.getLat())
                .lng(req.getLng())
                .contactName(req.getContactName())
                .contactRole(req.getContactRole())
                .altPhone(req.getAltPhone())
                .hasBloodBank(req.isHasBloodBank())
                .bbLicense(req.getBbLicense())
                .open24x7(req.isOpen24x7())
                .openTime(req.getOpenTime())
                .closeTime(req.getCloseTime())
                .beds(req.getBeds())
                .icuBeds(req.getIcuBeds())
                .build();

        hospitalRepository.save(hospital);

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .fullName(hospital.getName())
                .build();
    }
}
