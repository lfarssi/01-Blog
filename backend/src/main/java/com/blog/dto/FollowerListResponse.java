package com.blog.dto;

import java.time.Instant;

public record FollowerListResponse(
        Long id,
        String username,
        String email,
        Instant followedAt
) {}
