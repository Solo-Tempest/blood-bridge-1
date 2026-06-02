package com.bloodbridge.api.service;

import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.DonorNotification;
import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.enums.BloodGroup;
import com.bloodbridge.api.entity.enums.NotificationStatus;
import com.bloodbridge.api.entity.enums.UrgencyLevel;
import com.bloodbridge.api.repository.BloodRequestRepository;
import com.bloodbridge.api.repository.DonorNotificationRepository;
import com.bloodbridge.api.repository.DonorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DonorMatchingService {

    private final DonorRepository donorRepository;
    private final DonorNotificationRepository notificationRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final SmsService emailService;

    // Which donor blood groups can donate to a given requested blood group
    private static final Map<BloodGroup, List<BloodGroup>> COMPATIBLE_DONORS = new EnumMap<>(BloodGroup.class);

    static {
        COMPATIBLE_DONORS.put(BloodGroup.O_NEGATIVE,  List.of(BloodGroup.O_NEGATIVE));
        COMPATIBLE_DONORS.put(BloodGroup.O_POSITIVE,  List.of(BloodGroup.O_NEGATIVE, BloodGroup.O_POSITIVE));
        COMPATIBLE_DONORS.put(BloodGroup.A_NEGATIVE,  List.of(BloodGroup.O_NEGATIVE, BloodGroup.A_NEGATIVE));
        COMPATIBLE_DONORS.put(BloodGroup.A_POSITIVE,  List.of(BloodGroup.O_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.A_NEGATIVE, BloodGroup.A_POSITIVE));
        COMPATIBLE_DONORS.put(BloodGroup.B_NEGATIVE,  List.of(BloodGroup.O_NEGATIVE, BloodGroup.B_NEGATIVE));
        COMPATIBLE_DONORS.put(BloodGroup.B_POSITIVE,  List.of(BloodGroup.O_NEGATIVE, BloodGroup.O_POSITIVE, BloodGroup.B_NEGATIVE, BloodGroup.B_POSITIVE));
        COMPATIBLE_DONORS.put(BloodGroup.AB_NEGATIVE, List.of(BloodGroup.O_NEGATIVE, BloodGroup.A_NEGATIVE, BloodGroup.B_NEGATIVE, BloodGroup.AB_NEGATIVE));
        COMPATIBLE_DONORS.put(BloodGroup.AB_POSITIVE, Arrays.asList(BloodGroup.values()));
    }

    @Async
    @Transactional
    public void matchAndNotify(Long requestId) {
        try {
            BloodRequest request = bloodRequestRepository.findById(requestId).orElse(null);
            if (request == null) return;

            Hospital hospital = request.getHospital();
            if (hospital.getLat() == null || hospital.getLat().isBlank() ||
                hospital.getLng() == null || hospital.getLng().isBlank()) {
                log.warn("Hospital {} has no coordinates, skipping donor matching", hospital.getId());
                return;
            }

            double hospitalLat = Double.parseDouble(hospital.getLat());
            double hospitalLng = Double.parseDouble(hospital.getLng());
            double radiusKm    = getRadiusKm(request.getUrgency(), request.getEscalationLevel());

            List<BloodGroup> compatibleGroups = COMPATIBLE_DONORS.getOrDefault(request.getBloodGroup(), List.of());
            if (compatibleGroups.isEmpty()) return;

            List<Donor> candidates = donorRepository.findAvailableByBloodGroups(compatibleGroups);
            Map<Donor, Double> matchedWithDist = new LinkedHashMap<>();

            for (Donor donor : candidates) {
                if (!isEligible(donor)) continue;
                double dist = haversine(hospitalLat, hospitalLng, donor.getLatitude(), donor.getLongitude());
                if (radiusKm < 0 || dist <= radiusKm) {
                    matchedWithDist.put(donor, dist);
                }
            }

            String bloodGroupDisplay = formatBloodGroup(request.getBloodGroup());

            int created = 0;
            for (Map.Entry<Donor, Double> entry : matchedWithDist.entrySet()) {
                Donor donor = entry.getKey();
                double dist = entry.getValue();
                if (!notificationRepository.existsByDonorAndBloodRequest(donor, request)) {
                    notificationRepository.save(DonorNotification.builder()
                            .donor(donor)
                            .bloodRequest(request)
                            .status(NotificationStatus.PENDING)
                            .build());
                    emailService.sendBloodRequestNotification(
                            donor.getUser().getEmail(),
                            donor.getFullName(),
                            bloodGroupDisplay,
                            request.getUnits(),
                            request.getUrgency(),
                            hospital.getCity(),
                            dist
                    );
                    created++;
                }
            }

            request.setSent(request.getSent() + created);
            request.setPending(request.getPending() + created);
            bloodRequestRepository.save(request);

            log.info("Blood request {}: notified {} donors (radius {}km, urgency {})",
                    requestId, created, radiusKm < 0 ? "citywide" : radiusKm, request.getUrgency());

        } catch (Exception e) {
            log.error("Donor matching failed for request {}: {}", requestId, e.getMessage(), e);
        }
    }

    private String formatBloodGroup(BloodGroup bg) {
        return bg.name().replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
    }

    private boolean isEligible(Donor donor) {
        if (donor.getWeight() != null && donor.getWeight() < 50) return false;
        if (donor.getDateOfBirth() != null) {
            int age = LocalDate.now().getYear() - donor.getDateOfBirth().getYear();
            if (age < 18 || age > 65) return false;
        }
        if (donor.getLastDonationDate() != null &&
                donor.getLastDonationDate().isAfter(LocalDate.now().minusDays(90))) {
            return false;
        }
        return true;
    }

    // Returns radius in km; negative means citywide (no limit)
    private double getRadiusKm(UrgencyLevel urgency, int escalationLevel) {
        if (urgency == UrgencyLevel.CRITICAL) return -1;
        return switch (escalationLevel) {
            case 1  -> 5.0;
            case 2  -> 20.0;
            default -> -1;
        };
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
}
