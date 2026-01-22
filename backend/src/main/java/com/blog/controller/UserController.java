package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.ApiResponse;
import com.blog.dto.UserResponse;
import com.blog.service.UserService;
import java.util.Map; // ← NEW
import org.springframework.data.domain.Page; // ← NEW

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<Object> getUser(@PathVariable Long id) {
        return ApiResponse.from(200, "User Received successfully", userService.getUserProfile(id));

    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchUsers(@RequestParam("q") String query) {
        List<UserResponse> users = userService.SearchUsers(query);
        return ApiResponse.from(200, "Users found", users);
    }

    // Update profile
    // @PutMapping("/me")
    // public ResponseEntity<Object> updateProfile(@RequestBody UpdateProfileRequest
    // request, Authentication auth) {
    // String username = auth.getName();
    // UserResponse updated = userService.updateProfile(username, request);
    // return ApiResponse.from(200, "Profile updated", updated);
    // }

    // Upload avatar
    // @PostMapping("/me/avatar")
    // public ResponseEntity<Object> uploadAvatar(@RequestParam("avatar")
    // MultipartFile file, Authentication auth) {
    // String username = auth.getName();
    // UserResponse user = userService.uploadAvatar(username, file);
    // return ApiResponse.from(200, "Avatar uploaded", user);
    // }

    // Delete avatar
    // @DeleteMapping("/me/avatar")
    // public ResponseEntity<Object> deleteAvatar(Authentication auth) {
    // String username = auth.getName();
    // UserResponse user = userService.deleteAvatar(username);
    // return ApiResponse.from(200, "Avatar deleted", user);
    // }

    // Admin: Get all users with pagination/search
    @GetMapping(params = { "page" }) // Only match when ?page= param exists
    public ResponseEntity<Object> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {

        Page<UserResponse> usersPage = userService.getAllUsers(page, size, search);

        // Frontend expects {users: [], totalPages: number}
        Map<String, Object> responseData = Map.of(
                "users", usersPage.getContent(),
                "totalPages", usersPage.getTotalPages(),
                "currentPage", usersPage.getNumber(),
                "totalElements", usersPage.getTotalElements());

        return ApiResponse.from(200, "Users list", responseData);
    }

    // Admin: Ban user
    // @PostMapping("/{id}/ban")
    // public ResponseEntity<Object> banUser(@PathVariable Long id) {
    // userService.banUser(id);
    // return ApiResponse.from(200, "User banned", null);
    // }

    // // Admin: Unban user
    // @PostMapping("/{id}/unban")
    // public ResponseEntity<Object> unbanUser(@PathVariable Long id) {
    // userService.unbanUser(id);
    // return ApiResponse.from(200, "User unbanned", null);
    // }

    // Admin: Delete user
    // @DeleteMapping("/{id}")
    // public ResponseEntity<Object> deleteUser(@PathVariable Long id) {
    // userService.deleteUser(id);
    // return ApiResponse.from(200, "User deleted", null);
    // }

}
