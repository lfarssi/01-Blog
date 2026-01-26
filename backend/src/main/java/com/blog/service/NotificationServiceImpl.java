package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blog.dto.NotificationResponse;
import com.blog.entity.NotificationEntity;
import com.blog.entity.UserEntity;
import com.blog.exception.AccessDeniedException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.mapper.NotificationMapper;
import com.blog.repository.NotificationRepository;
import com.blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public List<NotificationResponse> getUserNotifications(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<NotificationEntity> notifications = notificationRepository
                .findByUser_IdOrderByCreatedAtDesc(user.getId());

        return notifications.stream()
                .map(NotificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<NotificationEntity> notifications = notificationRepository
                .findByUser_IdAndIsReadOrderByCreatedAtDesc(user.getId(), false);

        return notifications.stream()
                .map(NotificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized to update this notification");
        }

        notification.setIsRead(true);
        notification.setUpdatedAt(Instant.now());
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<NotificationEntity> unreadNotifications = notificationRepository
                .findByUser_IdAndIsReadOrderByCreatedAtDesc(user.getId(), false);

        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setUpdatedAt(Instant.now());
        });

        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    @Override
    public Long getUnreadCount(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return notificationRepository.countByUser_IdAndIsRead(user.getId(), false);
    }
    @Override
@Transactional
public void createNotification(Long receiverUserId, String type, String content, Long relatedId) {
    UserEntity receiver = userRepository.findById(receiverUserId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    NotificationEntity n = NotificationEntity.builder()
            .user(receiver)
            .type(type)              // e.g. "NEW_BLOG", "NEW_COMMENT", "NEW_FOLLOW"
            .content(content)        // message shown in UI
            .relatedId(relatedId)    // blogId or followerId or commentId (your choice)
            .status(true)            // optional
            .isRead(false)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

    notificationRepository.save(n);
}

}