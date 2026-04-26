package com.bloodbridge.api.repository;

import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByHospitalOrderByCreatedAtDesc(Hospital hospital);
    Optional<BloodRequest> findByIdAndHospital(Long id, Hospital hospital);
}
