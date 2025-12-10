package com.blog.auth.service;

import com.blog.auth.dto.UserResponse;

public interface UserService {
    UserResponse getUserProfile(String username);
    UserResponse updateUserProfile(String username);
    void banUser(long userId);
}
