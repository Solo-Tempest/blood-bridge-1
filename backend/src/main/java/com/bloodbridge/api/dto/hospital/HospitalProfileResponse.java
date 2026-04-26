package com.bloodbridge.api.dto.hospital;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HospitalProfileResponse {
    private Long id;
    private String name;
    private String type;
    private String regNo;
    private Integer year;
    private String website;

    private String street;
    private String area;
    private String city;
    private String state;
    private String pincode;
    private String landmark;
    private String lat;
    private String lng;

    private String contactName;
    private String contactRole;
    private String phone;
    private String altPhone;
    private String email;

    private boolean hasBloodBank;
    private String bbLicense;
    private boolean open24x7;
    private String openTime;
    private String closeTime;
    private Integer beds;
    private Integer icuBeds;

    private int completion;
}
