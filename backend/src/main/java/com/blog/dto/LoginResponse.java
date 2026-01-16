package com.blog.dto;

// com/blog/dto/LoginResponse.java
import com.fasterxml.jackson.annotation.JsonProperty;

public record LoginResponse(
    @JsonProperty("token") String token,
    @JsonProperty("id") Long id,
    @JsonProperty("username") String username,
    @JsonProperty("email") String email,
    @JsonProperty("role") String role
) {}
