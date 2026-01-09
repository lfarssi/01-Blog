package com.blog.dto;

import java.time.Instant;

import com.blog.entity.BlogEntity;
import com.blog.entity.UserEntity;

public record CommentResponse(
        Long id,
        BlogEntity blogId,
        UserEntity userId,
        String username,
        String content,
        Instant createdAt
) {}