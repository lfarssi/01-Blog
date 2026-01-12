package com.blog.dto;

import java.time.Instant;

public record BlogResponse(
        Long id,
        String title,
        String content,
        String media,
        Long likeCount,
        Long commentCount,
        Instant createdAt,
        Instant updatedAt,
        UserInfo author
) {
    public record UserInfo(
            Long id,
            String username,
            String email
    ) {}
}
