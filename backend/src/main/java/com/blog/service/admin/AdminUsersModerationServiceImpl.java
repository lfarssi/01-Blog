package com.blog.service.admin;

import com.blog.entity.UserEntity;
import com.blog.exception.ResourceNotFoundException;
import com.blog.repository.BlogRepository;
import com.blog.repository.CommentRepository;
import com.blog.repository.FollowRepository;
import com.blog.repository.LikeRepository;
import com.blog.repository.NotificationRepository;
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
    private final BlogRepository blogRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final NotificationRepository notificationRepository;
    private final FollowRepository followRepository;

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
        // ✅ Order matters: children first
        commentRepository.deleteAllByUserId(userId); // user's comments
        likeRepository.deleteAllByUserId(userId); // user's likes
        commentRepository.deleteAllByBlogUserId(userId); // Custom method needed, see below
            likeRepository.deleteAllByBlogUserId(userId);  // Critical for this error


        blogRepository.deleteAllByUserId(userId); // user's blogs
        followRepository.deleteAllByFollowerId(userId); // user's follows
        followRepository.deleteAllByFollowingId(userId);
        notificationRepository.deleteAllByUserId(userId);

        userRepository.deleteById(userId); // ✅ finally user
    }

}
