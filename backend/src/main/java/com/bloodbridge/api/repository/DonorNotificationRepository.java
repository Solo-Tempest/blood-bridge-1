package com.bloodbridge.api.repository;

import com.bloodbridge.api.entity.BloodRequest;
import com.bloodbridge.api.entity.Donor;
import com.bloodbridge.api.entity.DonorNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DonorNotificationRepository extends JpaRepository<DonorNotification, Long> {
    List<DonorNotification> findByDonorOrderBySentAtDesc(Donor donor);
    Optional<DonorNotification> findByIdAndDonor(Long id, Donor donor);
    boolean existsByDonorAndBloodRequest(Donor donor, BloodRequest bloodRequest);

    @Query("SELECT n FROM DonorNotification n JOIN FETCH n.donor d JOIN FETCH d.user WHERE n.bloodRequest.id = :requestId ORDER BY n.sentAt DESC")
    List<DonorNotification> findByBloodRequestIdWithDonors(@Param("requestId") Long requestId);
}
