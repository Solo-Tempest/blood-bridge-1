package com.bloodbridge.api.repository;

import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.HospitalDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HospitalDocumentRepository extends JpaRepository<HospitalDocument, Long> {
    List<HospitalDocument> findByHospitalOrderByUploadedAtDesc(Hospital hospital);
    Optional<HospitalDocument> findByIdAndHospital(Long id, Hospital hospital);
}
