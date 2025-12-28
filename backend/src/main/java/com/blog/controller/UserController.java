package com.blog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.UserResponse;
import com.blog.service.UserService;


@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    UserService userService;

    @GetMapping("/{username}")
    public ResponseEntity<UserResponse> getUser(@PathVariable String username){
        return ResponseEntity.ok(userService.getUserProfile(username));
    }
}
