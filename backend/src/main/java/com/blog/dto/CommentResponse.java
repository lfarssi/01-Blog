package com.blog.dto;

import java.time.Instant;

public record CommentResponse(
        Long id,
        String content,
        Instant createdAt,
        AuthorInfo author
) {
    public record AuthorInfo(
            Long id,
            String username,
            String email
    ) {}
}
