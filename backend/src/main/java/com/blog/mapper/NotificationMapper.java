package com.blog.mapper;

import com.blog.dto.NotificationResponse;
import com.blog.entity.NotificationEntity;

public class NotificationMapper {
    public static NotificationResponse toResponse(NotificationEntity notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getContent(),
                notification.getRelatedId(),
                notification.getIsRead(),
                notification.getCreatedAt()
        );
    }
}
