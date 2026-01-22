package com.blog.dto;

import java.time.Instant;




public record UserResponse(
    Long id,
    String username, 
    String email,
    String role,
    boolean banned,
    Instant createdAt
) {}
