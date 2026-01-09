package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.FollowResponse;
import com.blog.dto.FollowerListResponse;

import java.util.List;

@Service
public interface FollowService {
    FollowResponse toggleFollow(String targetUsername, String username);
    FollowResponse getFollowStatus(String targetUsername, String username);
    List<FollowerListResponse> getFollowers(String username);
    List<FollowerListResponse> getFollowing(String username);
}
