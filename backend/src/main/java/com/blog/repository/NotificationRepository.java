package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.blog.entity.NotificationEntity;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<NotificationEntity> findByUser_IdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead);

    long countByUser_IdAndIsRead(Long userId, Boolean isRead);

    void deleteByUser_Id(Long userId);

    // NotificationRepository.java
    @Modifying
    @Query("DELETE FROM NotificationEntity n WHERE n.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}