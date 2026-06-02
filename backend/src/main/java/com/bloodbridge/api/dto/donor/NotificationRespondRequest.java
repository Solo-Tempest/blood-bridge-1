package com.bloodbridge.api.dto.donor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class NotificationRespondRequest {
    @NotBlank
    @Pattern(regexp = "ACCEPT|DECLINE", message = "Action must be ACCEPT or DECLINE")
    private String action;
}
