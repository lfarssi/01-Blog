package com.blog.auth.dto;

import java.time.Instant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
      private Long id;
    private String username;
    private String email;
    private boolean banned;
    private Instant createdAt;
    
}
