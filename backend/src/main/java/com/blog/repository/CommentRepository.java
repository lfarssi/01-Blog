package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.blog.entity.CommentEntity;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findByBlog_id(Long blogId);
    Long countByBlog_id(Long blogId);
    void deleteByIdAndUser_id(Long id, Long userId);
}
