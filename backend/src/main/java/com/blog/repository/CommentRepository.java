package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.blog.entity.CommentEntity;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    List<CommentEntity> findByBlog_Id(Long blogId);

    long countByBlog_Id(Long blogId);

    void deleteByIdAndUser_Id(Long id, Long userId);

    void deleteAllByBlog_Id(Long blogId);

    // CommentRepository.java
    @Modifying
    @Query("DELETE FROM CommentEntity c WHERE c.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM CommentEntity c WHERE c.blog.userId.id = :userId")
    void deleteAllByBlogUserId(@Param("userId") Long userId);
}
