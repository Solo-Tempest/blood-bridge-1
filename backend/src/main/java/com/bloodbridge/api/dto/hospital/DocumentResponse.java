package com.bloodbridge.api.dto.hospital;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DocumentResponse {
    private Long id;
    private String type;
    private String originalName;
    private Long fileSize;
    private String status;
    private LocalDateTime uploadedAt;
}
