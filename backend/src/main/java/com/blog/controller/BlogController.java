package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.blog.dto.ApiResponse;

import com.blog.dto.BlogResponse;
import com.blog.service.BlogService;

@RestController
@RequestMapping("/blogs")
public class BlogController {
    @Autowired
    private BlogService blogService;

    @GetMapping("/{id}")
    public ResponseEntity<Object> getBlog(@PathVariable Long id) {
        return ApiResponse.from(200, "Blog Received successfully", blogService.getBlogDetails(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Object> getBlogsByUser(
            @PathVariable Long userId, // profile owner ID
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication // ✅ Add this
    ) {
        String currentUsername = authentication.getName(); // current logged-in user
        List<BlogResponse> blogs = blogService.getUserBlogs(userId, currentUsername, page, size);
        return ApiResponse.from(200, "User blogs", blogs);
    }

    @GetMapping("/following")
    public ResponseEntity<Object> getFollowingBlogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String username = authentication.getName(); // current user [web:211]
        List<BlogResponse> blogs = blogService.getFollowingBlogs(username, page, size);
        return ApiResponse.from(200, "Following blogs", blogs);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> createBlog(
            @RequestPart("title") String title,
            @RequestPart("content") String content,
            @RequestPart(value = "media", required = false) List<MultipartFile> media,
            Authentication authentication) {

        String username = authentication.getName();

        BlogResponse blog = blogService.createBlog(
                title,
                content,
                media,
                username);

        return ApiResponse.from(200, "Blog Created successfully", blog);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> updateBlog(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content,
            @RequestPart(value = "media", required = false) List<MultipartFile> media,
            Authentication authentication) {

        String username = authentication.getName();
        BlogResponse blog = blogService.updateBlog(id, title, content, media, username);
        return ApiResponse.from(200, "Blog Updated successfully", blog);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteBlog(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        blogService.deleteBlog(id, username);
        return ApiResponse.from(200, "Blog Deleted successfully", null);
    }
}
