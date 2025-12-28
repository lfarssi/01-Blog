package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.UserResponse;
import com.blog.mapper.UserMapper;
import com.blog.entity.UserEntity;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    @Override
    public UserResponse getUserProfile(String username){
        UserEntity user = userRepository.findByUsername(username).orElseThrow(()-> new RuntimeException("User not found"));
        return  UserMapper.toResponse(user);
    }
}
