package com.blog.dto;

public record BlogUpdateRequest(
        String title,
        String content, 
        String media
) { }
