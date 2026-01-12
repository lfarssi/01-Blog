package com.blog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.ApiResponse;
import com.blog.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    UserService userService;
    @GetMapping("/{username}")
    public ResponseEntity<Object> getUser(@PathVariable String username) {
                return  ApiResponse.from(200, "User Received successfully",userService.getUserProfile(username));

    }

  

}
