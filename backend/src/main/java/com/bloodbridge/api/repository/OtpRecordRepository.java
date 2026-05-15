package com.bloodbridge.api.repository;

import com.bloodbridge.api.entity.OtpRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpRecordRepository extends JpaRepository<OtpRecord, Long> {

    Optional<OtpRecord> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);

    long countByEmailAndCreatedAtAfter(String email, LocalDateTime after);

    @Modifying
    @Query("UPDATE OtpRecord o SET o.used = true WHERE o.email = :email AND o.used = false")
    void invalidateAllByEmail(@Param("email") String email);
}
