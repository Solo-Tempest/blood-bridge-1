package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.hospital.BloodRequestCreateRequest;
import com.bloodbridge.api.dto.hospital.BloodRequestResponse;
import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.entity.enums.BloodGroup;
import com.bloodbridge.api.entity.enums.RequestStatus;
import com.bloodbridge.api.entity.enums.UrgencyLevel;
import com.bloodbridge.api.exception.ApiException;
import com.bloodbridge.api.repository.BloodRequestRepository;
import com.bloodbridge.api.repository.HospitalRepository;
import com.bloodbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;

    public List<BloodRequestResponse> getRequests(String email) {
        Hospital hospital = resolveHospital(email);
        return bloodRequestRepository.findByHospitalOrderByCreatedAtDesc(hospital)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public BloodRequestResponse create(String email, BloodRequestCreateRequest req) {
        Hospital hospital = resolveHospital(email);

        BloodGroup bloodGroup;
        try {
            bloodGroup = BloodGroup.valueOf(req.getBloodGroup());
        } catch (IllegalArgumentException e) {
            throw new ApiException("Invalid blood group: " + req.getBloodGroup(), HttpStatus.BAD_REQUEST);
        }

        UrgencyLevel urgency;
        try {
            urgency = UrgencyLevel.valueOf(req.getUrgency().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException("Invalid urgency level: " + req.getUrgency(), HttpStatus.BAD_REQUEST);
        }

        int estimated = estimateDonors(req.getDistanceKm(), bloodGroup);

        BloodRequest request = BloodRequest.builder()
                .hospital(hospital)
                .bloodGroup(bloodGroup)
                .units(req.getUnits())
                .donorsNeeded(req.getDonorsNeeded())
                .urgency(urgency)
                .distanceKm(req.getDistanceKm())
                .patientName(req.getPatientName())
                .notes(req.getNotes())
                .sent(estimated)
                .accepted(0)
                .declined(0)
                .pending(estimated)
                .escalationLevel(1)
                .build();

        return toResponse(bloodRequestRepository.save(request));
    }

    @Transactional
    public BloodRequestResponse cancel(String email, Long id) {
        Hospital hospital = resolveHospital(email);
        BloodRequest request = bloodRequestRepository.findByIdAndHospital(id, hospital)
                .orElseThrow(() -> new ApiException("Request not found", HttpStatus.NOT_FOUND));
        if (request.getStatus() != RequestStatus.ACTIVE) {
            throw new ApiException("Only active requests can be cancelled", HttpStatus.BAD_REQUEST);
        }
        request.setStatus(RequestStatus.CANCELLED);
        return toResponse(bloodRequestRepository.save(request));
    }

    private int estimateDonors(int distanceKm, BloodGroup bloodGroup) {
        int bgIndex = bloodGroup.ordinal();
        return (int) Math.round((distanceKm * 3.2) + (bgIndex * 4) + 8);
    }

    private Hospital resolveHospital(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return hospitalRepository.findByUser(user)
                .orElseThrow(() -> new ApiException("Hospital not found", HttpStatus.NOT_FOUND));
    }

    private BloodRequestResponse toResponse(BloodRequest r) {
        return BloodRequestResponse.builder()
                .id(r.getId())
                .bloodGroup(r.getBloodGroup().name())
                .units(r.getUnits())
                .donorsNeeded(r.getDonorsNeeded())
                .urgency(r.getUrgency().name())
                .distanceKm(r.getDistanceKm())
                .patientName(r.getPatientName())
                .notes(r.getNotes())
                .status(r.getStatus().name())
                .sent(r.getSent())
                .accepted(r.getAccepted())
                .declined(r.getDeclined())
                .pending(r.getPending())
                .escalationLevel(r.getEscalationLevel())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
