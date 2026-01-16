package com.blog.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.blog.dto.FollowResponse;
import com.blog.dto.FollowerListResponse;

@Service
public interface FollowService {
    FollowResponse toggleFollow(Long targetUserId, String username);
    FollowResponse getFollowStatus(Long targetUserId, String username);
    List<FollowerListResponse> getFollowers(Long userId);
    List<FollowerListResponse> getFollowing(Long userId);
}
