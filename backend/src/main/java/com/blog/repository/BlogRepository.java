package com.blog.repository;

import org.springframework.stereotype.Repository;

import com.blog.entity.BlogEntity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface BlogRepository extends JpaRepository<BlogEntity, Long> {
    Optional<BlogEntity> findById(Integer id);
    // List<BlogEntity> findByUserIdId(Long userId);
    Page<BlogEntity> findByUserIdId(Long userId, Pageable pageable);
    Page<BlogEntity> findByUserId_IdIn(List<Long> userIds, Pageable pageable);

    // @Query("""
    //         SELECT new com.blog.dto.BlogResponse(
    //           b.id, b.title, b.content, b.media,
    //           (SELECT COUNT(l) FROM LikeEntity l WHERE l.blog.id = b.id),
    //           (SELECT COUNT(c) FROM CommentEntity c WHERE c.blog.id = b.id),
    //           b.createdAt, b.updatedAt,
    //           new com.blog.dto.UserResponse(b.userId.id, b.userId.username, b.userId.email)
    //         )
    //         FROM BlogEntity b
    //         WHERE b.id = :id
    //         """)
    // Optional<BlogResponse> findBlogWithCounts(@Param("id") Long id);

}
