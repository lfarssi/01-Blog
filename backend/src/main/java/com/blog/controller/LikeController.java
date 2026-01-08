package com.blog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.LikeResponse;
import com.blog.service.LikeService;

@RestController
@RequestMapping("/likes")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/blogs/{blogId}")
    public ResponseEntity<LikeResponse> toggleLike(
            @PathVariable Long blogId,
            Authentication authentication) {

        String username = authentication.getName();
        LikeResponse response = likeService.toggleLike(blogId, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/blogs/{blogId}")
    public ResponseEntity<LikeResponse> getLikeStatus(
            @PathVariable Long blogId,
            Authentication authentication) {

        String username = authentication.getName();
        LikeResponse response = likeService.getLikeStatus(blogId, username);
        return ResponseEntity.ok(response);
    }
}
