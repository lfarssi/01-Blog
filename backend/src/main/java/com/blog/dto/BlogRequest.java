package com.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BlogRequest(
        @NotBlank @Size(min = 3, max = 120)  String title,
        @NotBlank @Size(min = 20, max = 20000) String content,
        String media
) {}