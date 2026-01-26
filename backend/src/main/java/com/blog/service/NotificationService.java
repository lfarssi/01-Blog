package com.blog.service;



import org.springframework.stereotype.Service;

import com.blog.dto.NotificationResponse;

import java.util.List;

@Service
public interface NotificationService {
    List<NotificationResponse> getUserNotifications(String username);
    List<NotificationResponse> getUnreadNotifications(String username);
    void markAsRead(Long notificationId, String username);
    void markAllAsRead(String username);
    void deleteNotification(Long notificationId, String username);
    Long getUnreadCount(String username);
    void createNotification(Long receiverUserId, String type, String content, Long relatedId);

}