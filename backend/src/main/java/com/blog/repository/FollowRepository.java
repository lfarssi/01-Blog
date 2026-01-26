package com.blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.blog.entity.FollowEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<FollowEntity, Long> {
    Optional<FollowEntity> findByFollower_IdAndFollowing_Id(Long followerId, Long followingId);

    List<FollowEntity> findByFollower_Id(Long followerId);

    List<FollowEntity> findByFollowing_Id(Long followingId);

    @Query("select f.following.id from FollowEntity f where f.follower.id = :followerId")
    List<Long> findFollowingIdsByFollowerId(@Param("followerId") Long followerId);

    long countByFollower_Id(Long followerId);

    long countByFollowing_Id(Long followingId);

    boolean existsByFollower_IdAndFollowing_Id(Long followerId, Long followingId);

    void deleteByFollower_IdAndFollowing_Id(Long followerId, Long followingId);

    // FollowRepository.java
    @Modifying
    @Query("DELETE FROM FollowEntity f WHERE f.follower.id = :userId")
    void deleteAllByFollowerId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM FollowEntity f WHERE f.following.id = :userId")
    void deleteAllByFollowingId(@Param("userId") Long userId);
}
