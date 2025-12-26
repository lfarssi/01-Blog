package com.blog.mapper;


import com.blog.dto.UserResponse;
import com.blog.entity.UserEntity;

public class UserMapper {
       public static UserResponse toResponse(UserEntity user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .banned(user.isBanned())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
