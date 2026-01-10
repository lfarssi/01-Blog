package com.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BlogUpdateRequest(
                @NotBlank @Size(min = 3, max = 120) String title,
                @NotBlank @Size(min = 1, max = 20000) String content,
                @Size(max = 2048) String media) {
}
