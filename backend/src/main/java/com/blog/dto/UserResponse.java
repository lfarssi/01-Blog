package com.blog.dto;

import java.time.Instant;




public record UserResponse(
    Long id,
    String username, 
    String email,
    String Password,
    String role,
    boolean banned,
    Instant createdAt
) {}
