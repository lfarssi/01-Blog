package com.blog.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import com.blog.dto.UserRequest;
import com.blog.dto.UserResponse;
import com.blog.entity.UserEntity;
@Service
public interface UserService extends UserDetailsService   {
    UserResponse getUserProfile(Long id);
    List<UserResponse> SearchUsers(String username);
    void register(UserRequest request);
  public Optional<UserEntity> findByUsername(String username);
Page<UserResponse> getAllUsers(int page, int size, String search);

    // UserResponse updateUserProfile(String username);
    // void banUser(long userId);
}
