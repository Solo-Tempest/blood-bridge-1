package com.bloodbridge.api.service;

import com.bloodbridge.api.dto.ml.MlDonorRecord;
import com.bloodbridge.api.dto.ml.MlRankRequest;
import com.bloodbridge.api.dto.ml.MlRankResponse;
import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.enums.BloodGroup;
import com.bloodbridge.api.entity.enums.Gender;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MlRankingService {

    private final RestTemplate restTemplate;

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    /**
     * Ranks donors using the ML show-up prediction model and returns them in ranked
     * order mapped to their final_score. The returned LinkedHashMap preserves
     * insertion (rank) order and carries the score so callers can persist it.
     *
     * Falls back to ascending distance sort with null scores when the ML service
     * is unavailable.
     */
    public LinkedHashMap<Donor, Double> rankWithScores(List<Donor> donors,
                                                       BloodRequest request,
                                                       Map<Donor, Double> distanceMap) {
        if (donors.isEmpty()) return new LinkedHashMap<>();

        try {
            List<MlDonorRecord> records = donors.stream()
                    .map(d -> toRecord(d, request, distanceMap.get(d)))
                    .collect(Collectors.toList());

            MlRankRequest req = MlRankRequest.builder()
                    .urgency(request.getUrgency().name())
                    .donors(records)
                    .build();

            MlRankResponse response = restTemplate.postForObject(
                    mlServiceUrl + "/rank-donors", req, MlRankResponse.class
            );

            if (response != null && response.getRankedDonors() != null && !response.getRankedDonors().isEmpty()) {
                Map<String, Donor> byId = donors.stream()
                        .collect(Collectors.toMap(d -> d.getId().toString(), d -> d));

                LinkedHashMap<Donor, Double> result = new LinkedHashMap<>();
                response.getRankedDonors().forEach(rd -> {
                    Donor d = byId.get(rd.getDonorId());
                    if (d != null) result.put(d, rd.getFinalScore());
                });

                log.info("ML ranking applied: {} donors ranked for blood request {} (top score: {})",
                        result.size(), request.getId(),
                        result.values().stream().findFirst().orElse(0.0));
                return result;
            }
        } catch (Exception e) {
            log.warn("ML service unavailable, falling back to distance sort: {}", e.getMessage());
        }

        // Fallback: closest donor first, score null (ML was unavailable)
        LinkedHashMap<Donor, Double> fallback = new LinkedHashMap<>();
        donors.stream()
                .sorted(Comparator.comparingDouble(d -> distanceMap.getOrDefault(d, Double.MAX_VALUE)))
                .forEach(d -> fallback.put(d, null));
        return fallback;
    }

    private MlDonorRecord toRecord(Donor donor, BloodRequest request, Double distanceKm) {
        int age = 30;
        if (donor.getDateOfBirth() != null) {
            age = (int) ChronoUnit.YEARS.between(donor.getDateOfBirth(), LocalDate.now());
        }

        int genderM = donor.getGender() == Gender.MALE ? 1 : 0;

        int lastDonationDays = 999;
        if (donor.getLastDonationDate() != null) {
            lastDonationDays = (int) ChronoUnit.DAYS.between(donor.getLastDonationDate(), LocalDate.now());
        }

        int totalDonations = donor.getTotalDonations();

        return MlDonorRecord.builder()
                .donorId(donor.getId().toString())
                .age(age)
                .genderM(genderM)
                .distanceKm(distanceKm != null ? distanceKm : 999.0)
                .daysSinceLastDonation(lastDonationDays)
                .isNewDonor(totalDonations == 0 ? 1 : 0)
                .totalDonations(totalDonations)
                .bloodMatchLevel(bloodMatchLevel(donor.getBloodGroup(), request.getBloodGroup()))
                .availabilityFlag(1)
                .build();
    }

    /**
     * Scores how closely the donor's blood group matches the needed group.
     *   1.0 = exact same group
     *   0.9 = same ABO type, different Rh  (e.g. A- donating to A+)
     *   0.8 = O-type universal donor to a different ABO
     *   0.7 = other compatible cross-type donation
     */
    private double bloodMatchLevel(BloodGroup donor, BloodGroup needed) {
        if (donor == needed) return 1.0;
        String donorBase  = donor.name().replace("_POSITIVE", "").replace("_NEGATIVE", "");
        String neededBase = needed.name().replace("_POSITIVE", "").replace("_NEGATIVE", "");
        if (donorBase.equals(neededBase)) return 0.9;
        if (donorBase.equals("O")) return 0.8;
        return 0.7;
    }
}
