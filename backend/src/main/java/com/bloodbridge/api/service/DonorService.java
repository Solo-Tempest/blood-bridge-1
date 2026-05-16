package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.donor.DonorNotificationResponse;
import com.bloodbridge.api.dto.donor.DonorProfileResponse;
import com.bloodbridge.api.dto.donor.DonorUpdateRequest;
import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.DonorNotification;
import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.entity.enums.NotificationStatus;
import com.bloodbridge.api.exception.ApiException;
import com.bloodbridge.api.repository.BloodRequestRepository;
import com.bloodbridge.api.repository.DonorNotificationRepository;
import com.bloodbridge.api.repository.DonorRepository;
import com.bloodbridge.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorRepository donorRepository;
    private final UserRepository userRepository;
    private final DonorNotificationRepository notificationRepository;
    private final BloodRequestRepository bloodRequestRepository;

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

    @Transactional(readOnly = true)
    public List<DonorNotificationResponse> getNotifications(String email) {
        Donor donor = resolveDonor(email);
        return notificationRepository.findByDonorOrderBySentAtDesc(donor)
                .stream().map(this::toNotificationResponse).toList();
    }

    @Transactional
    public DonorNotificationResponse respondToNotification(String email, Long notifId, String action) {
        Donor donor = resolveDonor(email);
        DonorNotification notif = notificationRepository.findByIdAndDonor(notifId, donor)
                .orElseThrow(() -> new ApiException("Notification not found", HttpStatus.NOT_FOUND));

        if (notif.getStatus() != NotificationStatus.PENDING) {
            throw new ApiException("Notification already responded to", HttpStatus.BAD_REQUEST);
        }

        BloodRequest request = notif.getBloodRequest();
        boolean accepted = "ACCEPT".equals(action);
        notif.setStatus(accepted ? NotificationStatus.ACCEPTED : NotificationStatus.DECLINED);
        notif.setRespondedAt(LocalDateTime.now());
        notificationRepository.save(notif);

        if (accepted) {
            request.setAccepted(request.getAccepted() + 1);
        } else {
            request.setDeclined(request.getDeclined() + 1);
        }
        request.setPending(Math.max(0, request.getPending() - 1));
        bloodRequestRepository.save(request);

        return toNotificationResponse(notif);
    }

    private DonorNotificationResponse toNotificationResponse(DonorNotification n) {
        BloodRequest req      = n.getBloodRequest();
        Hospital     hospital = req.getHospital();
        Donor        donor    = n.getDonor();

        // Parse raw hospital coordinates once
        Double rawLat = null, rawLng = null;
        if (hospital.getLat() != null && !hospital.getLat().isBlank()) {
            try { rawLat = Double.parseDouble(hospital.getLat()); } catch (NumberFormatException ignored) {}
        }
        if (hospital.getLng() != null && !hospital.getLng().isBlank()) {
            try { rawLng = Double.parseDouble(hospital.getLng()); } catch (NumberFormatException ignored) {}
        }

        // Distance from donor to hospital (rounded to 1 dp)
        Double distanceKm = null;
        if (rawLat != null && rawLng != null &&
                donor.getLatitude() != null && donor.getLongitude() != null) {
            double d = haversine(donor.getLatitude(), donor.getLongitude(), rawLat, rawLng);
            distanceKm = Math.round(d * 10.0) / 10.0;
        }

        boolean revealed = n.getStatus() == NotificationStatus.ACCEPTED;

        return DonorNotificationResponse.builder()
                .id(n.getId())
                .bloodRequestId(req.getId())
                .bloodGroup(req.getBloodGroup().name())
                .urgency(req.getUrgency().name())
                .status(n.getStatus().name())
                .units(req.getUnits())
                .donorsNeeded(req.getDonorsNeeded())
                .notes(req.getNotes())
                .distanceKm(distanceKm)
                .hospitalCity(hospital.getCity())
                .hospitalLat(rawLat)
                .hospitalLng(rawLng)
                .hospitalName(revealed ? hospital.getName() : null)
                .hospitalStreet(revealed ? hospital.getStreet() : null)
                .hospitalArea(revealed ? hospital.getArea() : null)
                .contactPhone1(revealed ? req.getContactPhone1() : null)
                .contactPhone2(revealed ? req.getContactPhone2() : null)
                .sentAt(n.getSentAt())
                .respondedAt(n.getRespondedAt())
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

    private Donor resolveDonor(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        return donorRepository.findByUser(user)
                .orElseThrow(() -> new ApiException("Donor profile not found", HttpStatus.NOT_FOUND));
    }
}
