package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.BlogRequest;
import com.blog.dto.BlogResponse;
import com.blog.dto.BlogUpdateRequest;

import java.util.List;

@Service
public interface BlogService {
    BlogResponse getBlogDetails(Long id);
    BlogResponse createBlog(BlogRequest request, String username);
    BlogResponse updateBlog(Long id, BlogUpdateRequest request, String username);
    void deleteBlog(Long id, String username);
    List<BlogResponse> getAllBlogs();
    List<BlogResponse> getBlogsByUser(String username);
}
