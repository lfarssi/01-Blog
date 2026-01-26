package com.blog.repository;

import org.springframework.stereotype.Repository;
import com.blog.entity.UserEntity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable; // ← THE MISSING ONE
import org.springframework.data.domain.Page; // ← ADD THIS
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
        Optional<UserEntity> findByUsername(String username);

        Optional<UserEntity> findById(Long id);

        Optional<UserEntity> findByEmail(String email); // Add this

        boolean existsByUsername(String username);

        boolean existsByEmail(String email);

        @Query("SELECT u FROM UserEntity u")
        Page<UserEntity> findAllUsers(Pageable pageable);

        List<UserEntity> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        String username, String email);

        // Page<UserEntity> findByUsernameContainingIgnoreCase(String username, Pageable
        // pageable);
        @Query("SELECT u FROM UserEntity u WHERE u.banned = false " +
                        "AND (:search IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<UserEntity> findPublicUsers(@Param("search") String search, Pageable pageable);

        // Add to UserRepository
        @Query("SELECT u FROM UserEntity u WHERE u.banned = false")
        Page<UserEntity> findNonBannedUsers(Pageable pageable);

}
