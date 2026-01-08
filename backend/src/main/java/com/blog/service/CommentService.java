package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;

import java.util.List;

@Service
public interface CommentService {
    CommentResponse createComment(Long blogId, CommentRequest request, String username);
    List<CommentResponse> getCommentsByBlogId(Long blogId);
    void deleteComment(Long commentId, String username);
}