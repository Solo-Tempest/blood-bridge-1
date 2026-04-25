package com.bloodbridge.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "hospitals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "reg_no", nullable = false)
    private String regNo;

    @Column
    private String type;

    @Column
    private Integer year;

    @Column
    private String website;

    // Address
    @Column
    private String street;

    @Column
    private String area;

    @Column
    private String city;

    @Column
    private String state;

    @Column
    private String pincode;

    @Column
    private String landmark;

    @Column
    private String lat;

    @Column
    private String lng;

    // Contact
    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_role")
    private String contactRole;

    @Column(name = "alt_phone")
    private String altPhone;

    // Facilities
    @Column(name = "has_blood_bank")
    private boolean hasBloodBank;

    @Column(name = "bb_license")
    private String bbLicense;

    @Column(name = "is_24x7")
    private boolean open24x7;

    @Column(name = "open_time")
    private String openTime;

    @Column(name = "close_time")
    private String closeTime;

    @Column
    private Integer beds;

    @Column(name = "icu_beds")
    private Integer icuBeds;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
