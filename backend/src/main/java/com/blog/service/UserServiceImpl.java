package com.blog.service;

import com.blog.dto.UserRequest;
import com.blog.dto.UserResponse;
import com.blog.entity.UserEntity;
import com.blog.exception.ResourceAlreadyExistsException;
import com.blog.mapper.UserMapper;
import com.blog.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    @Override
    public Optional<UserEntity> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public UserResponse getUserProfile(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceAlreadyExistsException("User not found"));

        return UserMapper.toResponse(user);
    }
    @Override
    public List<UserResponse> SearchUsers(String query) {  // ✅ "searchUsers" + "query"
    // ✅ Find MULTIPLE users (LIKE search)
    List<UserEntity> users = userRepository
        .findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    
    // ✅ Convert ALL to DTO list
    return users.stream()
        .map(UserMapper::toResponse)  // ✅ List mapper
        .collect(Collectors.toList());
}
    @Override
    public void register(UserRequest request) {

        if (userRepository.existsByUsername(request.username())) {
            throw new ResourceAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        UserEntity user = UserEntity.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .username(request.username())
                .createdAt(Instant.now())
                .build();

        userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail)
            throws UsernameNotFoundException {

        // Try to find by username first, then by email
        UserEntity user = userRepository.findByUsername(usernameOrEmail)
                .orElseGet(() -> userRepository.findByEmail(usernameOrEmail)
                        .orElseThrow(() -> new UsernameNotFoundException(
                                "User not found with username or email: " + usernameOrEmail)));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole())
                .build();
    }
}
