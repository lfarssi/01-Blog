package com.blog.service;

// import org.springframework.stereotype.Service;

// import com.blog.dto.UserResponse;
// import com.blog.entity.User;
// import com.blog.presistence.UserRepository;

// import lombok.RequiredArgsConstructor;

// // @Service
// @RequiredArgsConstructor
// public class UserServiceImpl implements UserService {
//     private final UserRepository userRepository;

//     @Override
//     public UserResponse getUserProfile(String username){
//         User user = userRepository.findByUsername(username).orElseThrow(()-> new RuntimeException("User not found"));
//         return  UserMapper.toResponse(user);
//     }
// }
