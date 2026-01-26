package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.LoginRequest;
import com.blog.dto.LoginResponse;
@Service
public interface AuthService {
    public LoginResponse login(LoginRequest request);

}
