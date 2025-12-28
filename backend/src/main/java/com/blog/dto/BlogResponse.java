package com.blog.dto;

import java.time.Instant;

public record BlogResponse(
        Long id,
        String content,
        String title,
        String media,
        Instant createdAt
) {}
