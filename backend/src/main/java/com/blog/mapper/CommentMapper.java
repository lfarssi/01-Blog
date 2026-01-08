package com.blog.mapper;

import com.blog.dto.CommentResponse;
import com.blog.entity.CommentEntity;
import com.blog.entity.UserEntity;

public class CommentMapper {
    public static CommentResponse toResponse(CommentEntity comment, UserEntity user) {
        return new CommentResponse(
                comment.getId(),
                comment.getBlog_id(),
                comment.getUser_id(),
                user.getUsername(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}