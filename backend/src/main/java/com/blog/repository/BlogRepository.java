package com.blog.repository;

import org.springframework.stereotype.Repository;

import com.blog.entity.BlogEntity;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface BlogRepository extends JpaRepository<BlogEntity, Long>  {
    Optional<BlogEntity> findById(Integer id);
    
}
