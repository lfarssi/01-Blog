package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blog.dto.ApiResponse;
import com.blog.dto.FollowResponse;
import com.blog.dto.FollowerListResponse;
import com.blog.service.FollowService;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
@RestController
@RequestMapping("/follow")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping("/{userId}")
    public ResponseEntity<Object> toggleFollow(
            @PathVariable Long userId,
            Authentication authentication) {

        String currentUsername = authentication.getName(); // still fine here [web:7][web:13]
        FollowResponse response = followService.toggleFollow(userId, currentUsername);
        String message = (response.following() ? "follow" : "unfollow") + " successfully";
        return ApiResponse.from(200, message, response);
    }

    @GetMapping("/{userId}/status")
    public ResponseEntity<Object> getFollowStatus(
            @PathVariable Long userId,
            Authentication authentication) {

        String currentUsername = authentication.getName();
        FollowResponse response = followService.getFollowStatus(userId, currentUsername);
        return ApiResponse.from(200, "Follow Status received successfully", response);
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<Object> getFollowers(@PathVariable Long userId) {
        List<FollowerListResponse> followers = followService.getFollowers(userId);
        return ApiResponse.from(200, "Follower list received successfully", followers);
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<Object> getFollowing(@PathVariable Long userId) {
        List<FollowerListResponse> following = followService.getFollowing(userId);
        return ApiResponse.from(200, "Following list received successfully", following);
    }
}
