package com.blog.service.admin;

import com.blog.entity.UserEntity;
import com.blog.exception.ResourceNotFoundException;
import com.blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminUsersModerationServiceImpl implements AdminUsersModerationService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public void banUser(Long userId, String currentUsername) {
        blockSelfAction(userId, currentUsername);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setBanned(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void unbanUser(Long userId, String currentUsername) {
        blockSelfAction(userId, currentUsername);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setBanned(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId, String currentUsername) {
        blockSelfAction(userId, currentUsername);

        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        // TODO (important): delete blogs/comments/likes/notifications for this user
        // first
        // e.g. blogRepository.deleteAllByUserId(userId);
        // commentRepository.deleteAllByUserId(userId); etc.

        userRepository.deleteById(userId);
    }

    private void blockSelfAction(Long targetUserId, String currentUsername) {
        UserEntity current = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "Current user not found"));

        if (current.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot moderate your own account");
        }
    }

    @Override
    @Transactional
    public void deleteUserAndAllContent(Long userId) {
        // TODO: add delete blogs/comments/likes/notifications first
        // For now just delete user
        userRepository.deleteById(userId);
    }
}
