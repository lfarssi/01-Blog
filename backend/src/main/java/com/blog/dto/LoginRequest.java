package com.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(@NotBlank @Size(min=3,max=30) String usernameOrEmail, @NotBlank @Size(min=8,max=32) String password) {}

