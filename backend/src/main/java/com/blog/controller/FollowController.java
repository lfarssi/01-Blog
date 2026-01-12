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

    @PostMapping("/{username}")
    public ResponseEntity<Object> toggleFollow(@PathVariable String username, Authentication authentication) {
        String currentUsername = authentication.getName();
        FollowResponse response = followService.toggleFollow(username, currentUsername);
        return  ApiResponse.from(200, response.following()? "follow":"unfollow"+"  successfully", response);
    }

    @GetMapping("/{username}/status")
    public ResponseEntity<Object> getFollowStatus(
            @PathVariable String username,
            Authentication authentication) {

        String currentUsername = authentication.getName();
        FollowResponse response = followService.getFollowStatus(username, currentUsername);
        return  ApiResponse.from(200, "Follow Status Received successfully", response);
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<Object> getFollowers(@PathVariable String username) {
        List<FollowerListResponse> followers = followService.getFollowers(username);
        return  ApiResponse.from(200, "Follower List Received successfully", followers);
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<Object> getFollowing(@PathVariable String username) {
        List<FollowerListResponse> following = followService.getFollowing(username);
        return  ApiResponse.from(200, "Following List Received successfully", following);
    }

}
