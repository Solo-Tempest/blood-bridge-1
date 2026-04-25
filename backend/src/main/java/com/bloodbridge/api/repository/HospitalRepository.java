package com.bloodbridge.api.repository;

import com.bloodbridge.api.entity.Hospital;
import com.bloodbridge.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByUser(User user);
    Optional<Hospital> findByUserId(Long userId);
}
