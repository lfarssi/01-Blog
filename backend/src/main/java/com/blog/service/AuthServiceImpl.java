package com.blog.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.blog.config.JwtService;
import com.blog.dto.LoginRequest;
import com.blog.dto.LoginResponse;
import com.blog.entity.UserEntity;
import com.blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public LoginResponse login(LoginRequest request) {
        String principal = request.usernameOrEmail().trim();

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(principal, request.password())
        );

        UserEntity user = userRepository.findByUsername(principal)
            .orElseGet(() -> userRepository.findByEmail(principal)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + principal)));

        String token = jwtService.generateToken(user.getUsername());
        return new LoginResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
