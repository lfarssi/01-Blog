package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.blog.entity.NotificationEntity;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<NotificationEntity> findByUser_IdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead);
    long countByUser_IdAndIsRead(Long userId, Boolean isRead);
    void deleteByUser_Id(Long userId);
}
