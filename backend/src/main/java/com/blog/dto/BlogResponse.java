package com.blog.dto;

import java.time.Instant;

public record BlogResponse(
        Long id,
        String title,
        String content,
        String media,
        Boolean visible,
        Long likeCount,
        Long commentCount,
        Instant createdAt,
        Instant updatedAt,
        UserResponse author
) {

}
