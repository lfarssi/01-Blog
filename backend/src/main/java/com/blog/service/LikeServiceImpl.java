package com.blog.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blog.dto.LikeResponse;
import com.blog.entity.BlogEntity;
import com.blog.entity.LikeEntity;
import com.blog.entity.UserEntity;
import com.blog.exception.BlogUnavailableException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.repository.BlogRepository;
import com.blog.repository.LikeRepository;
import com.blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public LikeResponse toggleLike(Long blogId, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BlogEntity blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        // Prevent liking hidden or deleted blogs
        if (blog.getVisible() != null && !blog.getVisible()){
            throw new BlogUnavailableException("Cannot like a hidden or deleted blog");
        }

        Optional<LikeEntity> existingLike = likeRepository.findByBlog_IdAndUser_Id(blogId, user.getId());

        boolean liked;
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            liked = false;
        } else {
            LikeEntity like = LikeEntity.builder()
                    .blog(blog)
                    .user(user)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            likeRepository.save(like);
            liked = true;

            // Send notification if not self-like
            if (!blog.getUserId().getId().equals(user.getId())) {
                notificationService.createNotification(
                        blog.getUserId().getId(),
                        "NEW_LIKE",
                        user.getUsername() + " liked your blog",
                        blogId);
            }
        }

        Long likeCount = likeRepository.countByBlog_Id(blogId);
        blog.setLike_count(likeCount);
        blogRepository.save(blog);

        return new LikeResponse(liked, likeCount);
    }

    @Override
    public LikeResponse getLikeStatus(Long blogId, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BlogEntity blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        // Prevent fetching like status for hidden/deleted blogs
        if (blog.getVisible() != null && !blog.getVisible()) {
            throw new BlogUnavailableException("Cannot get like status for a hidden or deleted blog");
        }

        boolean liked = likeRepository.existsByBlog_IdAndUser_Id(blogId, user.getId());
        Long likeCount = likeRepository.countByBlog_Id(blogId);

        return new LikeResponse(liked, likeCount);
    }

 
}