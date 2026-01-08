package com.blog.dto;

public record BlogRequest(
        String title,
        String content,
        String media
) {}