package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

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

        // ✅ Fix: check blog null FIRST
        if (blog == null) {
            // Try full findById for owners/admins
            blog = blogRepository.findById(id).orElse(null);
            if (blog == null) {
                throw new ResourceNotFoundException("Blog not found");
            }
        }

        // ✅ Safe checks
        boolean isOwner = currentUser != null && currentUser.getId().equals(blog.getUserId().getId());
        boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole()); // ✅ String compare

        if (!blog.getVisible() && !isOwner && !isAdmin) {
            throw new ResourceNotFoundException("Blog not found");
        }

        // ✅ Update counts (safe)
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
                .media(mediaJson) // ✅ STRING
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
                    f.getFollower().getId(), // receiver (the follower)
                    "NEW_BLOG",
                    user.getUsername() + " posted a new blog",
                    saved.getId() // relatedId = blogId
            );
        }
        return BlogMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public BlogResponse updateBlog(Long id, String title, String content, List<MultipartFile> mediaFiles,
            String username) {
        // Auth check
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        BlogEntity blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        if (!Objects.equals(blog.getUserId().getId(), user.getId())) {
            throw new AccessDeniedException("Unauthorized to update this blog");
        }

        // Update text (optional)
        if (title != null && !title.trim().isEmpty())
            blog.setTitle(title);
        if (content != null && !content.trim().isEmpty())
            blog.setContent(content);

        // Update media (optional - replaces existing)
        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            MediaValidator.validate(mediaFiles);
            List<String> mediaPaths = mediaStorageService.store(mediaFiles);

            // ✅ Simple JSON array (your exact create format)
            String mediaJson;
            try {
                mediaJson = new ObjectMapper().writeValueAsString(mediaPaths);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize media", e);
            }
            blog.setMedia(mediaJson);
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
    // ✅ Replace your existing getBlogsByUser
    public List<BlogResponse> getUserBlogs(Long profileUserId, String currentUsername, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Long currentUserId = null;
        if (currentUsername != null) {
            currentUserId = userRepository.findByUsername(currentUsername)
                    .map(UserEntity::getId)
                    .orElse(null);
        }

        Page<BlogEntity> blogs;
        if (currentUserId != null && currentUserId.equals(profileUserId)) {
            // ✅ Owner: see ALL blogs (including hidden)
            blogs = blogRepository.findByUserIdIdOrderByCreatedAtDesc(profileUserId, pageable);
        } else {
            // ✅ Visitor: only VISIBLE blogs
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

        // 1) get followed user ids
        List<Long> followedIds = followRepository.findFollowingIdsByFollowerId(me.getId());
        if (followedIds.isEmpty())
            return List.of();

        // 2) page request (newest first)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")); // [web:204]

        // 3) query blogs by authors you follow
        var pageResult = blogRepository.findByUserIdsAndVisibleTrue(followedIds, pageable);

        // 4) map to BlogResponse (reuse your existing mapper)
        return pageResult.getContent().stream()
                .map(BlogMapper::toResponse) // <-- use your existing mapping logic
                .toList();
    }

}
