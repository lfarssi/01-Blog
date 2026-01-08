package com.blog.dto;

import java.time.Instant;

public record CommentResponse(
        Long id,
        Long blogId,
        Long userId,
        String username,
        String content,
        Instant createdAt
) {}
