package com.blog.repository;

import org.springframework.stereotype.Repository;

import com.blog.entity.BlogEntity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface BlogRepository extends JpaRepository<BlogEntity, Long> {
    Optional<BlogEntity> findById(Integer id);

    // ✅ FIXED: use @Query for List<Long>
    @Query("SELECT b FROM BlogEntity b WHERE b.userId.id IN :userIds")
    Page<BlogEntity> findByUserIds(@Param("userIds") List<Long> userIds, Pageable pageable);

    @Query("SELECT b FROM BlogEntity b WHERE b.userId.id IN :userIds AND b.visible = true")
    Page<BlogEntity> findByUserIdsAndVisibleTrue(@Param("userIds") List<Long> userIds, Pageable pageable);

    // ✅ Keep these (they work)
    Page<BlogEntity> findByUserIdId(Long userId, Pageable pageable);

    Page<BlogEntity> findByUserIdIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<BlogEntity> findByUserIdIdAndVisibleTrueOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<BlogEntity> findByIdAndVisibleTrue(Long id);

    // ✅ Delete methods
    @Modifying
    @Query("DELETE FROM BlogEntity b WHERE b.userId.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);
}
