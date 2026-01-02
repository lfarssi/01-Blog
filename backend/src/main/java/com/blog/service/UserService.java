package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.UserResponse;
@Service
public interface UserService  {
    UserResponse getUserProfile(String username);
    // UserResponse updateUserProfile(String username);
    // void banUser(long userId);
}
