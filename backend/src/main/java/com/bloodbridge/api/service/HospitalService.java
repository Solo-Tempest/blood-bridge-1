package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.hospital.HospitalProfileResponse;
import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.exception.ApiException;
import com.bloodbridge.api.repository.HospitalRepository;
import com.bloodbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    public HospitalProfileResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Hospital h = hospitalRepository.findByUser(user)
                .orElseThrow(() -> new ApiException("Hospital profile not found", HttpStatus.NOT_FOUND));
        return toResponse(h, user);
    }

    private HospitalProfileResponse toResponse(Hospital h, User user) {
        return HospitalProfileResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .type(h.getType())
                .regNo(h.getRegNo())
                .year(h.getYear())
                .website(h.getWebsite())
                .street(h.getStreet())
                .area(h.getArea())
                .city(h.getCity())
                .state(h.getState())
                .pincode(h.getPincode())
                .landmark(h.getLandmark())
                .lat(h.getLat())
                .lng(h.getLng())
                .contactName(h.getContactName())
                .contactRole(h.getContactRole())
                .phone(user.getPhone())
                .altPhone(h.getAltPhone())
                .email(user.getEmail())
                .hasBloodBank(h.isHasBloodBank())
                .bbLicense(h.getBbLicense())
                .open24x7(h.isOpen24x7())
                .openTime(h.getOpenTime())
                .closeTime(h.getCloseTime())
                .beds(h.getBeds())
                .icuBeds(h.getIcuBeds())
                .completion(computeCompletion(h, user))
                .build();
    }

    private int computeCompletion(Hospital h, User user) {
        int total = 15;
        int filled = 0;
        if (notBlank(h.getName()))        filled++;
        if (notBlank(h.getRegNo()))       filled++;
        if (notBlank(h.getType()))        filled++;
        if (h.getYear() != null)          filled++;
        if (notBlank(h.getWebsite()))     filled++;
        if (notBlank(h.getStreet()))      filled++;
        if (notBlank(h.getCity()))        filled++;
        if (notBlank(h.getState()))       filled++;
        if (notBlank(h.getPincode()))     filled++;
        if (notBlank(h.getContactName())) filled++;
        if (notBlank(user.getPhone()))    filled++;
        if (notBlank(user.getEmail()))    filled++;
        if (notBlank(h.getLat()))         filled++;
        if (notBlank(h.getLng()))         filled++;
        if (h.getBeds() != null)          filled++;
        return (int) Math.round((double) filled / total * 100);
    }

    private boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}
