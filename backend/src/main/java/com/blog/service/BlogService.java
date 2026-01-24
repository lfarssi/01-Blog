package com.blog.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.blog.dto.BlogResponse;

@Service
public interface BlogService {
    List<BlogResponse> getAllBlogs();

    BlogResponse getBlogDetails(Long id);

    public BlogResponse createBlog(
            String title,
            String content,
            List<MultipartFile> mediaFiles,
            String username);

public BlogResponse updateBlog(Long id, String title, String content, List<MultipartFile> mediaFiles, String username);

    void deleteBlog(Long id, String username);

    List<BlogResponse> getBlogsByUser(Long id);
}
