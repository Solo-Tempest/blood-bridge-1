package com.bloodbridge.api.controller;

import com.bloodbridge.api.dto.hospital.BloodRequestCreateRequest;
import com.bloodbridge.api.dto.hospital.BloodRequestResponse;
import com.bloodbridge.api.dto.hospital.DocumentResponse;
import com.bloodbridge.api.dto.hospital.HospitalProfileResponse;
import com.bloodbridge.api.service.BloodRequestService;
import com.bloodbridge.api.service.DocumentService;
import com.bloodbridge.api.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/hospital")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;
    private final DocumentService documentService;
    private final BloodRequestService bloodRequestService;

    /* ── Profile ── */

    @GetMapping("/me")
    public ResponseEntity<HospitalProfileResponse> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(hospitalService.getProfile(auth.getName()));
    }

    /* ── Documents ── */

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentResponse>> getDocuments(Authentication auth) {
        return ResponseEntity.ok(documentService.getDocuments(auth.getName()));
    }

    @PostMapping(value = "/documents/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("type") String type,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.upload(auth.getName(), type, file));
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id, Authentication auth) {
        Resource resource = documentService.loadFile(auth.getName(), id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
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
}
