package com.blog.dto;

import java.time.Instant;

import lombok.*;


@Data
@Builder
public class UserResponse {

    private Long id;

    private String username;

    private String email;

    private boolean banned;

    private Instant createdAt;

    
}
