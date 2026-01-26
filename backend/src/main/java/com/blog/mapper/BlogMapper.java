package com.blog.mapper;

import com.blog.dto.BlogResponse;
import com.blog.dto.UserResponse;
import com.blog.entity.BlogEntity;

public class BlogMapper {
    public static BlogResponse toResponse(BlogEntity blog) {
        UserResponse author = new UserResponse(
            blog.getUserId().getId(),
            blog.getUserId().getUsername(),
            blog.getUserId().getEmail(),
            blog.getUserId().getRole(),
            blog.getUserId().getBanned(),
            blog.getUserId().getCreatedAt()
        );
        
        return new BlogResponse(
            blog.getId(),
            blog.getTitle(),
            blog.getContent(),
            blog.getMedia(),
            blog.getVisible(),
            blog.getLike_count(),    // ✅ Your BlogEntity field
            blog.getComment_count(), // ✅ Your BlogEntity field
            blog.getCreatedAt(),
            blog.getUpdatedAt(),
            author                   // ✅ Full UserResponse
        );
    }   
}
