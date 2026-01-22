package com.blog.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.blog.dto.BlogResponse;
import com.blog.dto.BlogUpdateRequest;

@Service
public interface BlogService {
    List<BlogResponse> getAllBlogs();

    BlogResponse getBlogDetails(Long id);

    public BlogResponse createBlog(
            String title,
            String content,
            List<MultipartFile> mediaFiles,
            String username);

    BlogResponse updateBlog(Long id, BlogUpdateRequest request, String username);

    void deleteBlog(Long id, String username);

    List<BlogResponse> getBlogsByUser(Long id);
}
