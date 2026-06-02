package com.bloodbridge.api.repository;

import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByHospitalOrderByCreatedAtDesc(Hospital hospital);
    Optional<BloodRequest> findByIdAndHospital(Long id, Hospital hospital);

    @Query("SELECT r FROM BloodRequest r WHERE r.status = com.bloodbridge.api.entity.enums.RequestStatus.ACTIVE " +
           "AND r.urgency != com.bloodbridge.api.entity.enums.UrgencyLevel.CRITICAL " +
           "AND r.escalationLevel < 3 " +
           "AND r.accepted < r.donorsNeeded")
    List<BloodRequest> findActiveRequestsNeedingEscalation();
}
