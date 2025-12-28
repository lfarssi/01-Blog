package com.blog.mapper;


import com.blog.dto.UserResponse;
import com.blog.entity.UserEntity;

public class UserMapper {
       public static UserResponse toResponse(UserEntity user) {
        return new UserResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getPassword(),
            user.getRole(),
            user.getBanned(),
            user.getCreatedAt()
        );
    }
}
