package com.blog.dto;


import java.time.Instant;

public record ReportResponse(
        Long id,
        String reportedByUsername,
        Long targetId,
        String type,
        String reason,
        String status,
        Instant createdAt
) {}