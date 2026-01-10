package com.blog.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.blog.dto.UserRequest;
import com.blog.dto.UserResponse;
@Service
public interface UserService extends UserDetailsService   {
    UserResponse getUserProfile(String username);
    void register(UserRequest request);

    // UserResponse updateUserProfile(String username);
    // void banUser(long userId);
}
