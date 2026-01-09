package com.blog.dto;

import java.time.Instant;

public record NotificationResponse(
        Long id,
        String type,
        String content,
        Long relatedId,
        Boolean isRead,
        Instant createdAt
) {}