package com.bloodbridge.api.controller;

import com.bloodbridge.api.dto.donor.DonorNotificationResponse;
import com.bloodbridge.api.dto.donor.DonorProfileResponse;
import com.bloodbridge.api.dto.donor.DonorUpdateRequest;
import com.bloodbridge.api.dto.donor.NotificationRespondRequest;
import com.bloodbridge.api.service.DonorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
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

    @GetMapping(value = "/respond", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> respondByEmailToken(
            @RequestParam String token,
            @RequestParam String action) {
        DonorService.TokenRespondResult result = donorService.respondByToken(token, action);
        return ResponseEntity.ok(buildResponsePage(result, action));
    }

    private String buildResponsePage(DonorService.TokenRespondResult result, String action) {
        String emoji, heading, message, color;
        switch (result) {
            case ACCEPTED -> { emoji="✅"; heading="Request Accepted!"; color="#15803d";
                message="Thank you for accepting this blood request. The hospital will contact you shortly. Your details have been shared with them."; }
            case DECLINED -> { emoji="❌"; heading="Request Declined"; color="#dc2626";
                message="You have declined this blood request. Thank you for letting us know."; }
            case ALREADY_RESPONDED -> { emoji="ℹ️"; heading="Already Responded"; color="#1d4ed8";
                message="You have already responded to this blood request."; }
            case REQUEST_CLOSED -> { emoji="🔒"; heading="Request No Longer Active"; color="#6b7280";
                message="This blood request has been closed or fulfilled. No action is needed."; }
            default -> { emoji="⚠️"; heading="Invalid Link"; color="#a16207";
                message="This link is invalid or has expired. Please use the Blood Bridge app to respond to requests."; }
        }
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
              <title>Blood Bridge — Response</title>
              <style>
                *{box-sizing:border-box;margin:0;padding:0}
                body{font-family:Arial,sans-serif;background:#f0f4f8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
                .card{background:#fff;border-radius:16px;padding:40px 32px;max-width:440px;width:100%%;text-align:center;box-shadow:0 4px 24px #00000015}
                .emoji{font-size:56px;margin-bottom:16px}
                .title{font-size:22px;font-weight:700;color:%s;margin-bottom:12px}
                .msg{font-size:14px;color:#374151;line-height:1.6;margin-bottom:28px}
                .brand{font-size:13px;color:#9ca3af;border-top:1px solid #f1f5f9;padding-top:16px}
                .brand span{color:#dc2626;font-weight:700}
              </style>
            </head>
            <body>
              <div class="card">
                <div class="emoji">%s</div>
                <div class="title">%s</div>
                <p class="msg">%s</p>
                <div class="brand"><span>🩸 Blood Bridge</span> — Connecting donors with hospitals</div>
              </div>
            </body>
            </html>
            """.formatted(color, emoji, heading, message);
    }
}
