package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<FollowResponse> toggleFollow(@PathVariable String username, Authentication authentication) {
        String currentUsername = authentication.getName();
        FollowResponse response = followService.toggleFollow(username, currentUsername);
        return ResponseEntity.ok(response);
    }
  
    @GetMapping("/{username}/status")
    public ResponseEntity<FollowResponse> getFollowStatus(
            @PathVariable String username,
            Authentication authentication) {

        String currentUsername = authentication.getName();
        FollowResponse response = followService.getFollowStatus(username, currentUsername);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{username}/followers")
    public ResponseEntity<List<FollowerListResponse>> getFollowers(@PathVariable String username) {
        List<FollowerListResponse> followers = followService.getFollowers(username);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<FollowerListResponse>> getFollowing(@PathVariable String username) {
        List<FollowerListResponse> following = followService.getFollowing(username);
        return ResponseEntity.ok(following);
    }
    
}
