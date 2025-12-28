package com.blog.mapper;

import com.blog.dto.BlogResponse;
import com.blog.entity.BlogEntity;

public class BlogMapper {
    public static BlogResponse toResponse(BlogEntity blog) {
        return new BlogResponse(
                blog.getId(),
                blog.getContent(),
                blog.getTitle(),
                blog.getMedia(),
                blog.getCreatedAt());

    }   
}
