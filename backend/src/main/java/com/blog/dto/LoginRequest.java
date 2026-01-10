package com.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(@NotBlank @Size(min=3,max=15) String username, @NotBlank @Size(min=8,max=32) String password) {}

