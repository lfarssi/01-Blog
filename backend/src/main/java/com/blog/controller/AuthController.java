package com.blog.controller;

import com.blog.dto.ApiResponse;
import com.blog.dto.LoginRequest;
import com.blog.dto.LoginResponse;
import com.blog.dto.UserRequest;
import com.blog.repository.UserRepository;
import com.blog.service.AuthService;
import com.blog.service.UserService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController

@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    UserService userService;
    @Autowired
    AuthService authService;
    @Autowired
    UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.from(201, "User Logged successfully", response);
    }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@Valid @RequestBody UserRequest request) {
        userService.register(request);
        return ApiResponse.from(201, "User registered successfully", null);
    }
}
