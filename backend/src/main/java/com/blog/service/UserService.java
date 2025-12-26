package com.blog.service;

import com.blog.dto.UserResponse;

public interface UserService {
    UserResponse getUserProfile(String username);
    UserResponse updateUserProfile(String username);
    void banUser(long userId);
}
