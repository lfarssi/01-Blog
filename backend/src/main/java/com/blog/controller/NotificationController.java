package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.ApiResponse;
import com.blog.dto.NotificationResponse;
import com.blog.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<Object> getUserNotifications(
            Authentication authentication) {

        String username = authentication.getName();
        List<NotificationResponse> notifications = notificationService.getUserNotifications(username);
        return  ApiResponse.from(200, "User Notifications Received successfully", notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<Object> getUnreadNotifications(
            Authentication authentication) {

        String username = authentication.getName();
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(username);
        return  ApiResponse.from(200, "User Unread Notifications Received successfully", notifications);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Object> getUnreadCount(Authentication authentication) {
        String username = authentication.getName();
        Long count = notificationService.getUnreadCount(username);
        return  ApiResponse.from(200, "Count Notifications Received successfully", count);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Object> markAsRead(
            @PathVariable Long notificationId,
            Authentication authentication) {

        String username = authentication.getName();
        notificationService.markAsRead(notificationId, username);
        return  ApiResponse.from(200, "Notification Marked As Read",null);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Object> markAllAsRead(Authentication authentication) {
        String username = authentication.getName();
        notificationService.markAllAsRead(username);
        return  ApiResponse.from(200, "All Notifications Marked As Read",null);
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Object> deleteNotification(
            @PathVariable Long notificationId,
            Authentication authentication) {

        String username = authentication.getName();
        notificationService.deleteNotification(notificationId, username);
        return  ApiResponse.from(200, "Notification Deleted Successfully",null);

    }
}
