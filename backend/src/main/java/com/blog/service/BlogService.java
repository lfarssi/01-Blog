package com.blog.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.blog.dto.BlogRequest;
import com.blog.dto.BlogResponse;
import com.blog.dto.BlogUpdateRequest;
@Service
public interface BlogService {
    List<BlogResponse> getAllBlogs();
    BlogResponse getBlogDetails(Long id);
    BlogResponse createBlog(BlogRequest request, String username);
    BlogResponse updateBlog(Long id, BlogUpdateRequest request,String username);
    void deleteBlog(Long id, String username);
    List<BlogResponse> getBlogsByUser(Long id);
}
