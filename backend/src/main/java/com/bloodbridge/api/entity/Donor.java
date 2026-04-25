package com.bloodbridge.api.entity;

import com.bloodbridge.api.entity.enums.BloodGroup;
import com.bloodbridge.api.entity.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(name = "blood_group", nullable = false)
    private BloodGroup bloodGroup;

    @Column
    private Double weight;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String pincode;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column(name = "is_available")
    private boolean available = true;

    @Column(name = "total_donations")
    private int totalDonations = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
