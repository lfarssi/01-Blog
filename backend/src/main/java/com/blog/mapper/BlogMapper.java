package com.blog.mapper;

import com.blog.dto.BlogResponse;
import com.blog.entity.BlogEntity;

public class BlogMapper {
    public static BlogResponse toResponse(BlogEntity blog) {
        return new BlogResponse(
                blog.getId(),
                blog.getTitle(),
                blog.getContent(),
                blog.getMedia(),
                blog.getLike_count(),
                blog.getComment_count(),
                blog.getCreatedAt(),
                blog.getUpdatedAt(),
                new BlogResponse.UserInfo(
                        blog.getUserId().getId(),
                        blog.getUserId().getUsername(),
                        blog.getUserId().getEmail()
                )
        );
    }   
}
