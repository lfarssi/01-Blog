package com.blog.repository;

import org.springframework.stereotype.Repository;
import com.blog.entity.UserEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    Optional<UserEntity> findByEmail(String email); // Add this
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
