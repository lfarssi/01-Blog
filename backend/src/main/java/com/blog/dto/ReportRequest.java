package com.blog.dto;

import jakarta.validation.constraints.NotBlank;

public record ReportRequest(
        Long targetId,
        @NotBlank String type,
        @NotBlank String reason
) {}