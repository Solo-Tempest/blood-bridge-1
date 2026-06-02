package com.bloodbridge.api.service;

import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.enums.UrgencyLevel;
import com.bloodbridge.api.repository.BloodRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscalationService {

    private final BloodRequestRepository bloodRequestRepository;
    private final DonorMatchingService donorMatchingService;

    /**
     * Runs every 5 minutes.
     * Finds ACTIVE, non-CRITICAL requests that still need more donors
     * and escalates their radius if enough time has passed.
     *
     * Escalation levels:
     *   1 = 5 km  (initial)
     *   2 = 20 km
     *   3 = citywide (no radius limit)
     *
     * Thresholds (minutes since request was created):
     *   URGENT : L1→L2 at 10 min,  L2→L3 at 20 min
     *   NORMAL : L1→L2 at 15 min,  L2→L3 at 30 min
     */
    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void escalateStaleRequests() {
        List<BloodRequest> requests = bloodRequestRepository.findActiveRequestsNeedingEscalation();
        if (requests.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now();
        log.info("Escalation check: {} active request(s) being evaluated", requests.size());

        for (BloodRequest request : requests) {
            long minutesOld = ChronoUnit.MINUTES.between(request.getCreatedAt(), now);
            int newLevel = computeNewLevel(request.getUrgency(), request.getEscalationLevel(), minutesOld);

            if (newLevel > request.getEscalationLevel()) {
                request.setEscalationLevel(newLevel);
                bloodRequestRepository.save(request);
                donorMatchingService.matchAndNotify(request.getId());
                log.info("Request {} escalated: level {} → {} (age {}min, urgency {}, radius {})",
                        request.getId(),
                        newLevel - 1, newLevel,
                        minutesOld,
                        request.getUrgency(),
                        newLevel >= 3 ? "citywide" : (newLevel == 2 ? "20km" : "5km"));
            }
        }
    }

    private int computeNewLevel(UrgencyLevel urgency, int currentLevel, long minutesOld) {
        // Minutes elapsed before expanding the radius
        int l1ToL2 = urgency == UrgencyLevel.URGENT ? 10 : 15;
        int l2ToL3 = urgency == UrgencyLevel.URGENT ? 20 : 30;

        if (currentLevel == 1 && minutesOld >= l1ToL2) return 2;
        if (currentLevel == 2 && minutesOld >= l2ToL3) return 3;
        return currentLevel;
    }
}
