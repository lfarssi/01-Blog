package com.blog.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blog.dto.LikeResponse;
import com.blog.entity.BlogEntity;
import com.blog.entity.LikeEntity;
import com.blog.entity.UserEntity;
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

    @Override
    @Transactional
    public LikeResponse toggleLike(Long blogId, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BlogEntity blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        Optional<LikeEntity> existingLike = likeRepository.findByBlog_idAndUser_id(blogId, user.getId());

        boolean liked;
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            liked = false;
        } else {
            LikeEntity like = LikeEntity.builder()
                    .blog_id(blogId)
                    .user_id(user.getId())
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            likeRepository.save(like);
            liked = true;
        }

        Long likeCount = likeRepository.countByBlog_id(blogId);
        blog.setLike_count(likeCount);
        blogRepository.save(blog);

        return new LikeResponse(liked, likeCount);
    }

    @Override
    public LikeResponse getLikeStatus(Long blogId, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        boolean liked = likeRepository.existsByBlog_idAndUser_id(blogId, user.getId());
        Long likeCount = likeRepository.countByBlog_id(blogId);

        return new LikeResponse(liked, likeCount);
    }
}