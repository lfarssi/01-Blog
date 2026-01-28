package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import com.fasterxml.jackson.core.type.TypeReference;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.blog.dto.BlogResponse;
import com.blog.mapper.BlogMapper;
import com.blog.entity.BlogEntity;
import com.blog.entity.FollowEntity;
import com.blog.entity.UserEntity;
import com.blog.exception.AccessDeniedException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.helper.MediaValidator;
import com.blog.repository.BlogRepository;
import com.blog.repository.CommentRepository;
import com.blog.repository.FollowRepository;
import com.blog.repository.LikeRepository;
import com.blog.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
    @Autowired
    private BlogRepository blogRepository;
    @Autowired
    private LikeRepository likeRepository;
    @Autowired
    private FollowRepository followRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private MediaStorageService mediaStorageService;
    @Autowired
    private NotificationServiceImpl notificationService;

    @Override
    public BlogResponse getBlogDetails(Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();

        UserEntity currentUser = userRepository.findByUsername(currentUsername).orElse(null);

        BlogEntity blog = blogRepository.findByIdAndVisibleTrue(id).orElse(null);

        if (blog == null) {
            blog = blogRepository.findById(id).orElse(null);
            if (blog == null) {
                throw new ResourceNotFoundException("Blog not found");
            }
        }

        boolean isOwner = currentUser != null && currentUser.getId().equals(blog.getUserId().getId());
        boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole());

        if (!blog.getVisible() && !isOwner && !isAdmin) {
            throw new ResourceNotFoundException("Blog not found");
        }

        blog.setLike_count(likeRepository.countByBlog_Id(id));
        blog.setComment_count(commentRepository.countByBlog_Id(id));

        return BlogMapper.toResponse(blog);
    }

    @Override
    @Transactional
    public BlogResponse createBlog(
            String title,
            String content,
            List<MultipartFile> mediaFiles,
            String username) {

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        MediaValidator.validate(mediaFiles);

        List<String> mediaPaths = mediaStorageService.store(mediaFiles);

        String mediaJson;
        try {
            mediaJson = new ObjectMapper().writeValueAsString(mediaPaths);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize media", e);
        }

        BlogEntity blog = BlogEntity.builder()
                .title(title)
                .content(content)
                .media(mediaJson)
                .userId(user)
                .like_count(0L)
                .comment_count(0L)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        BlogEntity saved = blogRepository.save(blog);

        List<FollowEntity> followers = followRepository.findByFollowing_Id(user.getId());
        for (FollowEntity f : followers) {
            notificationService.createNotification(
                    f.getFollower().getId(),
                    "NEW_BLOG",
                    user.getUsername() + " posted a new blog",
                    saved.getId());
        }

        return BlogMapper.toResponse(saved);
    }

    // ✅ UPDATED: If mediaFiles is present => delete ALL old media + replace with
    // new.
    // If mediaFiles is null/empty => DO NOT touch media.
    @Override
    @Transactional
    public BlogResponse updateBlog(
            Long id,
            String title,
            String content,
            List<MultipartFile> mediaFiles,
            String username) {

        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BlogEntity blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        if (!Objects.equals(blog.getUserId().getId(), user.getId())) {
            throw new AccessDeniedException("Unauthorized to update this blog");
        }

        if (title != null && !title.trim().isEmpty())
            blog.setTitle(title.trim());
        if (content != null && !content.trim().isEmpty())
            blog.setContent(content.trim());

        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            MediaValidator.validate(mediaFiles);

            ObjectMapper om = new ObjectMapper();

            // 1) Parse old media safely (List<String>)
            List<String> oldMedia = List.of();
            try {
                String oldMediaJson = blog.getMedia();
                if (oldMediaJson != null && !oldMediaJson.isBlank()) {
                    oldMedia = om.readValue(oldMediaJson, new TypeReference<List<String>>() {
                    });
                }
            } catch (Exception e) {
                oldMedia = List.of();
            }

            // 2) Delete all old files
            mediaStorageService.delete(oldMedia);

            // 3) Store new and replace JSON
            List<String> mediaPaths = mediaStorageService.store(mediaFiles);
            try {
                blog.setMedia(om.writeValueAsString(mediaPaths));
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize media", e);
            }
        }

        blog.setUpdatedAt(Instant.now());
        BlogEntity saved = blogRepository.save(blog);
        return BlogMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteBlog(Long id, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BlogEntity blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        if (!blog.getUserId().getId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized to delete this blog");
        }

        blogRepository.delete(blog);
    }

    @Override
    public List<BlogResponse> getUserBlogs(Long profileUserId, String currentUsername, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        Long currentUserId = null;
        if (currentUsername != null) {
            currentUserId = userRepository.findByUsername(currentUsername)
                    .map(UserEntity::getId)
                    .orElse(null);
        }

        Page<BlogEntity> blogs;
        if (currentUserId != null && currentUserId.equals(profileUserId)) {
            blogs = blogRepository.findByUserIdIdOrderByCreatedAtDesc(profileUserId, pageable);
        } else {
            blogs = blogRepository.findByUserIdIdAndVisibleTrueOrderByCreatedAtDesc(profileUserId, pageable);
        }

        return blogs.getContent().stream()
                .map(BlogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<BlogResponse> getFollowingBlogs(String username, int page, int size) {
        var me = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Long> followedIds = followRepository.findFollowingIdsByFollowerId(me.getId());
        if (followedIds.isEmpty())
            return List.of();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt"));

        var pageResult = blogRepository.findByUserIdsAndVisibleTrue(followedIds, pageable);

        return pageResult.getContent().stream()
                .map(BlogMapper::toResponse)
                .toList();
    }
}
