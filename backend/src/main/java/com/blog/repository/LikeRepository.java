package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.blog.entity.LikeEntity;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
    Optional<LikeEntity> findByBlog_idAndUser_id(Long blogId, Long userId);
    Long countByBlog_id(Long blogId);
    boolean existsByBlog_idAndUser_id(Long blogId, Long userId);
    void deleteByBlog_idAndUser_id(Long blogId, Long userId);
}
