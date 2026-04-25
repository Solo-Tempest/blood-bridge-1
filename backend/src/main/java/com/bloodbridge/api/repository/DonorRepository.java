package com.bloodbridge.api.repository;

import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonorRepository extends JpaRepository<Donor, Long> {
    Optional<Donor> findByUser(User user);
    Optional<Donor> findByUserId(Long userId);
}
