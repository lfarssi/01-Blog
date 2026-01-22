package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.blog.dto.BlogResponse;
import com.blog.dto.BlogUpdateRequest;
import com.blog.mapper.BlogMapper;
import com.blog.entity.BlogEntity;
import com.blog.entity.UserEntity;
import com.blog.exception.AccessDeniedException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.helper.MediaValidator;
import com.blog.repository.BlogRepository;
import com.blog.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
    @Autowired
    private  BlogRepository blogRepository;
    @Autowired
    private  UserRepository userRepository;
    @Autowired
    private  MediaStorageService mediaStorageService;

    @Override
    public BlogResponse getBlogDetails(Long id) {
        BlogEntity blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
        return BlogMapper.toResponse(blog);
    }

    @Override
    public List<BlogResponse> getAllBlogs() {
        return blogRepository.findAll().stream()
                .map(BlogMapper::toResponse)
                .collect(Collectors.toList());
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

        return BlogMapper.toResponse(blogRepository.save(blog));
    }

    @Override
    @Transactional
    public BlogResponse updateBlog(Long id, BlogUpdateRequest request, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BlogEntity blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        if (!Objects.equals(blog.getUserId().getId(), user.getId())) {
            System.out.printf(
                    "updateBlog: blogId=%s, blogUserId=%s, authUserId=%s, username=%s%n",
                    id, blog.getUserId(), user.getId(), username);
            throw new AccessDeniedException("Unauthorized to update this blog");
        }

        if (request.title() != null) {
            blog.setTitle(request.title());
        }
        if (request.content() != null) {
            blog.setContent(request.content());
        }
        if (request.media() != null) {
            blog.setMedia(request.media());
        }
        blog.setUpdatedAt(Instant.now());

        blog = blogRepository.save(blog);
        return BlogMapper.toResponse(blog);
    }

    @Transactional
    public void deleteBlog(Long id, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BlogEntity blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        if (!blog.getUserId().equals(user.getId())) {
            throw new AccessDeniedException("Unauthorized to delete this blog");
        }

        blogRepository.delete(blog);
    }

    @Override
    public List<BlogResponse> getBlogsByUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return blogRepository.findAll().stream()
                .filter(blog -> blog.getUserId().equals(user.getId()))
                .map(BlogMapper::toResponse)
                .collect(Collectors.toList());
    }

}
