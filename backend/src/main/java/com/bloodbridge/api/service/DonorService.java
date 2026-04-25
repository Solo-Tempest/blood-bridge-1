package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.donor.DonorProfileResponse;
import com.bloodbridge.api.dto.donor.DonorUpdateRequest;
import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.exception.ApiException;
import com.bloodbridge.api.repository.DonorRepository;
import com.bloodbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;
    private final UserRepository userRepository;

    @Transactional
    public DonorProfileResponse updateProfile(String email, DonorUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Donor donor = donorRepository.findByUser(user)
                .orElseThrow(() -> new ApiException("Donor profile not found", HttpStatus.NOT_FOUND));

        if (!user.getPhone().equals(request.getPhone())) {
            userRepository.findByPhone(request.getPhone()).ifPresent(u -> {
                throw new ApiException("Phone number already in use", HttpStatus.CONFLICT);
            });
            user.setPhone(request.getPhone());
            userRepository.save(user);
        }

        donor.setFullName(request.getFullName());
        donor.setDateOfBirth(request.getDateOfBirth());
        donor.setGender(request.getGender());
        donor.setBloodGroup(request.getBloodGroup());
        donor.setWeight(request.getWeight());
        donor.setLastDonationDate(request.getLastDonationDate());
        donor.setCity(request.getCity());
        donor.setState(request.getState());
        donor.setPincode(request.getPincode());
        donorRepository.save(donor);

        return getProfile(email);
    }

    public DonorProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        Donor donor = donorRepository.findByUser(user)
                .orElseThrow(() -> new ApiException("Donor profile not found", HttpStatus.NOT_FOUND));

        return DonorProfileResponse.builder()
                .id(donor.getId())
                .fullName(donor.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .bloodGroup(donor.getBloodGroup().name())
                .gender(donor.getGender().name())
                .dateOfBirth(donor.getDateOfBirth())
                .weight(donor.getWeight())
                .lastDonationDate(donor.getLastDonationDate())
                .city(donor.getCity())
                .state(donor.getState())
                .pincode(donor.getPincode())
                .latitude(donor.getLatitude())
                .longitude(donor.getLongitude())
                .available(donor.isAvailable())
                .totalDonations(donor.getTotalDonations())
                .build();
    }
}
