package com.blog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.service.CommentService;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/blogs/{blogId}")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long blogId,
            @RequestBody CommentRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        CommentResponse response = commentService.createComment(blogId, request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/blogs/{blogId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByBlogId(@PathVariable Long blogId) {
        List<CommentResponse> comments = commentService.getCommentsByBlogId(blogId);
        return ResponseEntity.ok(comments);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {

        String username = authentication.getName();
        commentService.deleteComment(commentId, username);
        return ResponseEntity.ok("Comment deleted successfully");
    }
}
