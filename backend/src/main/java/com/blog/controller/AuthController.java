package com.blog.controller;

import com.blog.dto.ApiResponse;
import com.blog.dto.LoginRequest;
import com.blog.dto.LoginResponse;
import com.blog.dto.UserRequest;
import com.blog.entity.UserEntity;
import com.blog.repository.UserRepository;
import com.blog.service.UserService;

import jakarta.validation.Valid;

import com.blog.config.JwtService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController

@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    @Autowired
    UserService userService;
    @Autowired
    UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<Object> login(@Valid @RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.usernameOrEmail(),
                        request.password()));
        String token = jwtService.generateToken(request.usernameOrEmail());
        UserEntity user = userRepository.findByUsername(request.usernameOrEmail())
                .orElse(userRepository.findByEmail(request.usernameOrEmail()).orElseThrow());
        LoginResponse response = new LoginResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole());

        return ApiResponse.from(201, "User Logged successfully", response);
    }

    @PostMapping("/register")
    public ResponseEntity<Object> register(@Valid @RequestBody UserRequest request) {
        userService.register(request);
        return ApiResponse.from(201, "User registered successfully", null);
    }
}
