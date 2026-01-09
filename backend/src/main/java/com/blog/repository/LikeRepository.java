package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.blog.entity.LikeEntity;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
  Optional<LikeEntity> findByBlog_IdAndUser_Id(Long blogId, Long userId);
  long countByBlog_Id(Long blogId);
  boolean existsByBlog_IdAndUser_Id(Long blogId, Long userId);
  void deleteByBlog_IdAndUser_Id(Long blogId, Long userId);
}