package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.blog.dto.BlogRequest;
import com.blog.dto.BlogResponse;
import com.blog.dto.BlogUpdateRequest;
import com.blog.mapper.BlogMapper;
import com.blog.entity.BlogEntity;
import com.blog.entity.UserEntity;
import com.blog.exception.AccessDeniedException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.repository.BlogRepository;
import com.blog.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
    private final BlogRepository blogRepository;
    private final UserRepository userRepository;

    @Override
    public BlogResponse getBlogDetails(Long id){
        BlogEntity user = blogRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Blog not found"));
        return  BlogMapper.toResponse(user);
    }
    @Override
    public List<BlogResponse> getAllBlogs(){
        return blogRepository.findAll().stream()
                .map(BlogMapper::toResponse)
                .collect(Collectors.toList());
    }
    @Override
    @Transactional
    public BlogResponse createBlog(BlogRequest request, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BlogEntity blog = BlogEntity.builder()
                .title(request.title())
                .content(request.content())
                .media(request.media())
                .userId(user)
                .like_count(0L)
                .comment_count(0L)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        blog = blogRepository.save(blog);
        return BlogMapper.toResponse(blog);
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
    id, blog.getUserId(), user.getId(), username
);
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
    public List<BlogResponse> getBlogsByUser(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return blogRepository.findAll().stream()
                .filter(blog -> blog.getUserId().equals(user.getId()))
                .map(BlogMapper::toResponse)
                .collect(Collectors.toList());
    }

}
