package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.hospital.BloodRequestCreateRequest;
import com.bloodbridge.api.dto.hospital.BloodRequestResponse;
import com.bloodbridge.api.dto.hospital.RequestDonorResponse;
import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.DonorNotification;
import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.entity.enums.BloodGroup;
import com.bloodbridge.api.entity.enums.NotificationStatus;
import com.bloodbridge.api.entity.enums.RequestStatus;
import com.bloodbridge.api.entity.enums.UrgencyLevel;
import com.bloodbridge.api.exception.ApiException;
import com.bloodbridge.api.repository.BloodRequestRepository;
import com.bloodbridge.api.repository.DonorNotificationRepository;
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
    private final DonorMatchingService donorMatchingService;
    private final DonorNotificationRepository donorNotificationRepository;

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

        BloodRequest request = BloodRequest.builder()
                .hospital(hospital)
                .bloodGroup(bloodGroup)
                .units(req.getUnits())
                .donorsNeeded(req.getDonorsNeeded())
                .urgency(urgency)
                .distanceKm(req.getDistanceKm() != null ? req.getDistanceKm() : 0)
                .patientName(req.getPatientName())
                .notes(req.getNotes())
                .contactPhone1(req.getContactPhone1())
                .contactPhone2(req.getContactPhone2())
                .sent(0)
                .accepted(0)
                .declined(0)
                .pending(0)
                .escalationLevel(1)
                .build();

        BloodRequest saved = bloodRequestRepository.save(request);
        donorMatchingService.matchAndNotify(saved.getId());
        return toResponse(saved);
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

    @Transactional(readOnly = true)
    public List<RequestDonorResponse> getRequestDonors(String email, Long requestId) {
        Hospital hospital = resolveHospital(email);
        BloodRequest request = bloodRequestRepository.findByIdAndHospital(requestId, hospital)
                .orElseThrow(() -> new ApiException("Request not found", HttpStatus.NOT_FOUND));

        Double rawLat = null, rawLng = null;
        if (hospital.getLat() != null && !hospital.getLat().isBlank()) {
            try { rawLat = Double.parseDouble(hospital.getLat()); } catch (NumberFormatException ignored) {}
        }
        if (hospital.getLng() != null && !hospital.getLng().isBlank()) {
            try { rawLng = Double.parseDouble(hospital.getLng()); } catch (NumberFormatException ignored) {}
        }
        final Double hLat = rawLat, hLng = rawLng;

        return donorNotificationRepository.findByBloodRequestIdWithDonors(request.getId())
                .stream()
                .map(n -> toDonorResponse(n, hLat, hLng))
                .sorted(java.util.Comparator
                        .comparingDouble((RequestDonorResponse r) ->
                                r.getMlScore() != null ? -r.getMlScore() : Double.MAX_VALUE)
                        .thenComparingDouble(r ->
                                r.getDistanceKm() != null ? r.getDistanceKm() : Double.MAX_VALUE))
                .toList();
    }

    private RequestDonorResponse toDonorResponse(DonorNotification n, Double hLat, Double hLng) {
        Donor donor = n.getDonor();
        boolean accepted = n.getStatus() == NotificationStatus.ACCEPTED;

        Double distanceKm = null;
        if (hLat != null && hLng != null && donor.getLatitude() != null && donor.getLongitude() != null) {
            double d = haversine(donor.getLatitude(), donor.getLongitude(), hLat, hLng);
            distanceKm = Math.round(d * 10.0) / 10.0;
        }

        return RequestDonorResponse.builder()
                .notificationId(n.getId())
                .name(donor.getFullName())
                .bloodGroup(donor.getBloodGroup().name())
                .gender(donor.getGender().name())
                .city(donor.getCity())
                .state(donor.getState())
                .distanceKm(distanceKm)
                .status(n.getStatus().name())
                .sentAt(n.getSentAt())
                .respondedAt(n.getRespondedAt())
                .mlScore(n.getMlScore())
                .phone(accepted ? donor.getUser().getPhone() : null)
                .weight(accepted ? donor.getWeight() : null)
                .dateOfBirth(accepted ? donor.getDateOfBirth() : null)
                .lastDonationDate(accepted ? donor.getLastDonationDate() : null)
                .totalDonations(accepted ? donor.getTotalDonations() : null)
                .latitude(accepted ? donor.getLatitude() : null)
                .longitude(accepted ? donor.getLongitude() : null)
                .build();
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
                .contactPhone1(r.getContactPhone1())
                .contactPhone2(r.getContactPhone2())
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
