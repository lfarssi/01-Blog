package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.BlogResponse;
@Service
public interface BlogService {
    BlogResponse getBlogDetails(Integer id);
    // UserResponse updateUserProfile(String username);
    // void banUser(long userId);
}
