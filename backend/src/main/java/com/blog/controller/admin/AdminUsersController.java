package com.blog.controller.admin;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.server.ResponseStatusException;

import com.blog.dto.ApiResponse;
import com.blog.dto.UserResponse;
import com.blog.entity.UserEntity;
import com.blog.exception.ResourceNotFoundException;
import com.blog.repository.UserRepository;
import com.blog.service.UserService;
import com.blog.service.admin.AdminUsersModerationService;

@RestController
@RequestMapping("/admin/users") // with your global /api prefix => /api/admin/users
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsersController {

  @Autowired private UserService userService;
  @Autowired private UserRepository userRepository;
  @Autowired private AdminUsersModerationService adminUsersModerationService;

  @GetMapping
  public ResponseEntity<Object> getAllUsers(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) String search
  ) {
    Page<UserResponse> usersPage = userService.getAllUsers(page, size, search);

    Map<String, Object> responseData = Map.of(
        "users", usersPage.getContent(),
        "totalPages", usersPage.getTotalPages(),
        "currentPage", usersPage.getNumber(),
        "totalElements", usersPage.getTotalElements()
    );

    return ApiResponse.from(200, "Users list", responseData);
  }

  @PostMapping("/{id}/ban")
  public ResponseEntity<Object> banUser(@PathVariable Long id, Authentication auth) {
    blockSelfAction(id, auth);

    UserEntity user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    user.setBanned(true);
    userRepository.save(user);

    return ApiResponse.from(200, "User banned", null);
  }

  @PostMapping("/{id}/unban")
  public ResponseEntity<Object> unbanUser(@PathVariable Long id, Authentication auth) {
    blockSelfAction(id, auth);

    UserEntity user = userRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    user.setBanned(false);
    userRepository.save(user);

    return ApiResponse.from(200, "User unbanned", null);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Object> deleteUser(@PathVariable Long id, Authentication auth) {
    blockSelfAction(id, auth);

    if (!userRepository.existsById(id)) {
      throw new ResourceNotFoundException("User not found");
    }

    adminUsersModerationService.deleteUserAndAllContent(id);

    return ApiResponse.from(204, "User deleted", null);
  }

  private void blockSelfAction(Long targetUserId, Authentication auth) {
    String currentUsername = auth.getName();

    UserEntity current = userRepository.findByUsername(currentUsername)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.INTERNAL_SERVER_ERROR, "Current user not found"));

    if (current.getId().equals(targetUserId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot moderate your own account");
    }
  }
}
