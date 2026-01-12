package com.blog.mapper;

import com.blog.dto.CommentResponse;
import com.blog.entity.CommentEntity;

public class CommentMapper {
    public static CommentResponse toResponse(CommentEntity comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getCreatedAt(),
                new CommentResponse.AuthorInfo(
                        comment.getUser().getId(),
                        comment.getUser().getUsername(),
                        comment.getUser().getEmail()
                )
        );
    }
}
