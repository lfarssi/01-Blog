package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.blog.entity.LikeEntity;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<LikeEntity, Long> {
  Optional<LikeEntity> findByBlog_IdAndUser_Id(Long blogId, Long userId);

  long countByBlog_Id(Long blogId);

  boolean existsByBlog_IdAndUser_Id(Long blogId, Long userId);

  void deleteByBlog_IdAndUser_Id(Long blogId, Long userId);

  // LikeRepository.java
  @Modifying
  @Query("DELETE FROM LikeEntity l WHERE l.user.id = :userId")
  void deleteAllByUserId(@Param("userId") Long userId);

  @Modifying
  @Query(value = "DELETE FROM likes l WHERE l.blog_id IN (SELECT b.id FROM blogs b WHERE b.user_id = :userId)", nativeQuery = true)
  void deleteAllByBlogUserId(@Param("userId") Long userId);

}
