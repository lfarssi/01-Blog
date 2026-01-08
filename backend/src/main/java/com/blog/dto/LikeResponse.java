package com.blog.dto;


public record LikeResponse(
        boolean liked,
        Long likeCount
) {}
