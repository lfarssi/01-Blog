package com.blog.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.blog.dto.BlogRequest;
import com.blog.dto.BlogResponse;
import com.blog.dto.BlogUpdateRequest;
@Service
public interface BlogService {
    List<BlogResponse> getAllBlogs();
    BlogResponse getBlogDetails(Integer id);
    BlogResponse createBlog(BlogRequest request, String username);
    BlogResponse updateBlog(Integer id, BlogUpdateRequest request,String username);
    void deleteBlog(Integer id, String username);
    List<BlogResponse> getBlogsByUser(String username);
}
