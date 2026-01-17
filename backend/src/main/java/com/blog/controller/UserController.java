package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.ApiResponse;
import com.blog.dto.UserResponse;
import com.blog.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    UserService userService;
    @GetMapping("/{id}")
    public ResponseEntity<Object> getUser(@PathVariable Long id) {
                return  ApiResponse.from(200, "User Received successfully",userService.getUserProfile(id));

    }
   @GetMapping
public ResponseEntity<Object> searchUsers(@RequestParam("q") String query) {
    List<UserResponse> users = userService.SearchUsers(query);
    return ApiResponse.from(200, "Users found", users);
}


  

}
