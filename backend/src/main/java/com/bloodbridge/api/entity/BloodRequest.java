package com.bloodbridge.api.entity;

import com.bloodbridge.api.entity.enums.BloodGroup;
import com.bloodbridge.api.entity.enums.RequestStatus;
import com.bloodbridge.api.entity.enums.UrgencyLevel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "blood_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false)
    private BloodGroup bloodGroup;

    @Column(nullable = false)
    private Integer units;

    @Column(name = "donors_needed", nullable = false)
    private Integer donorsNeeded;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UrgencyLevel urgency;

    @Column(name = "distance_km", nullable = false)
    private Integer distanceKm;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column
    private String notes;

    @Column(name = "contact_phone1")
    private String contactPhone1;

    @Column(name = "contact_phone2")
    private String contactPhone2;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(nullable = false)
    private Integer sent;

    @Column(nullable = false)
    private Integer accepted;

    @Column(nullable = false)
    private Integer declined;

    @Column(nullable = false)
    private Integer pending;

    @Column(name = "escalation_level", nullable = false)
    private Integer escalationLevel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null)         status         = RequestStatus.ACTIVE;
        if (accepted == null)       accepted       = 0;
        if (declined == null)       declined       = 0;
        if (escalationLevel == null) escalationLevel = 1;
    }
}
