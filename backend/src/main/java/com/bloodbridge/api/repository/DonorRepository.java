package com.bloodbridge.api.repository;

import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.User;
import com.bloodbridge.api.entity.enums.BloodGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DonorRepository extends JpaRepository<Donor, Long> {
    Optional<Donor> findByUser(User user);
    Optional<Donor> findByUserId(Long userId);

    @Query("SELECT d FROM Donor d WHERE d.bloodGroup IN :bloodGroups AND d.available = true AND d.latitude IS NOT NULL AND d.longitude IS NOT NULL")
    List<Donor> findAvailableByBloodGroups(@Param("bloodGroups") List<BloodGroup> bloodGroups);
}
