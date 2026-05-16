package com.bloodbridge.api.controller;

import com.bloodbridge.api.dto.donor.DonorNotificationResponse;
import com.bloodbridge.api.dto.donor.DonorProfileResponse;
import com.bloodbridge.api.dto.donor.DonorUpdateRequest;
import com.bloodbridge.api.dto.donor.NotificationRespondRequest;
import com.bloodbridge.api.service.DonorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donor")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    @GetMapping("/me")
    public ResponseEntity<DonorProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(donorService.getProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<DonorProfileResponse> updateMyProfile(
            @Valid @RequestBody DonorUpdateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(donorService.updateProfile(authentication.getName(), request));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<DonorNotificationResponse>> getNotifications(Authentication authentication) {
        return ResponseEntity.ok(donorService.getNotifications(authentication.getName()));
    }

    @PostMapping("/notifications/{id}/respond")
    public ResponseEntity<DonorNotificationResponse> respondToNotification(
            @PathVariable Long id,
            @Valid @RequestBody NotificationRespondRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                donorService.respondToNotification(authentication.getName(), id, request.getAction()));
    }
}
