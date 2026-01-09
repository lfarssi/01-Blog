package com.blog.dto;
public record FollowResponse(
        boolean following,
        Long followerCount,
        Long followingCount
) {}