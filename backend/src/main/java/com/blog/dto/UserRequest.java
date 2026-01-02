package com.blog.dto;


public record UserRequest(
        String email,
        String username,
        String password
){}
