package com.blog.dto;

public record ReportRequest(
        Long targetId,
        String type,
        String reason
) {}
