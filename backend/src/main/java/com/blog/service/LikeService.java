package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.LikeResponse;

@Service
public interface LikeService {
    LikeResponse toggleLike(Long blogId, String username);
    LikeResponse getLikeStatus(Long blogId, String username);
}
