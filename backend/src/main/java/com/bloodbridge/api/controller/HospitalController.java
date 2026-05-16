package com.bloodbridge.api.controller;

import com.bloodbridge.api.dto.hospital.BloodRequestCreateRequest;
import com.bloodbridge.api.dto.hospital.BloodRequestResponse;
import com.bloodbridge.api.dto.hospital.ChangePasswordRequest;
import com.bloodbridge.api.dto.hospital.HospitalProfileResponse;
import com.bloodbridge.api.dto.hospital.RequestDonorResponse;
import com.bloodbridge.api.service.BloodRequestService;
import com.bloodbridge.api.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospital")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;
    private final BloodRequestService bloodRequestService;

    /* ── Profile ── */

    @GetMapping("/me")
    public ResponseEntity<HospitalProfileResponse> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(hospitalService.getProfile(auth.getName()));
    }

    /* ── Password ── */

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication auth) {
        hospitalService.changePassword(auth.getName(), request);
        return ResponseEntity.noContent().build();
    }

    /* ── Blood Requests ── */

    @GetMapping("/blood-requests")
    public ResponseEntity<List<BloodRequestResponse>> getBloodRequests(Authentication auth) {
        return ResponseEntity.ok(bloodRequestService.getRequests(auth.getName()));
    }

    @PostMapping("/blood-requests")
    public ResponseEntity<BloodRequestResponse> createBloodRequest(
            @Valid @RequestBody BloodRequestCreateRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bloodRequestService.create(auth.getName(), request));
    }

    @PutMapping("/blood-requests/{id}/cancel")
    public ResponseEntity<BloodRequestResponse> cancelBloodRequest(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(bloodRequestService.cancel(auth.getName(), id));
    }

    @GetMapping("/blood-requests/{id}/donors")
    public ResponseEntity<List<RequestDonorResponse>> getRequestDonors(
            @PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(bloodRequestService.getRequestDonors(auth.getName(), id));
    }
}
