package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.BlogRequest;
import com.blog.dto.BlogResponse;
import com.blog.dto.BlogUpdateRequest;
import com.blog.service.BlogService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/blogs")
public class BlogController {
    @Autowired
    private BlogService blogService;

    @GetMapping
    public ResponseEntity<List<BlogResponse>> getAllBlogs() {
        List<BlogResponse> blogs = blogService.getAllBlogs();
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlog(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getBlogDetails(id));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<BlogResponse>> getBlogsByUser(@PathVariable String username) {
        List<BlogResponse> blogs = blogService.getBlogsByUser(username);
        return ResponseEntity.ok(blogs);
    }

    @PostMapping
    public ResponseEntity<BlogResponse> createBlog(
            @Valid @RequestBody BlogRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        BlogResponse blog = blogService.createBlog(request, username);
        return ResponseEntity.ok(blog);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogResponse> updateBlog(
            @PathVariable Long id,
            @RequestBody BlogUpdateRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        BlogResponse blog = blogService.updateBlog(id, request, username);
        return ResponseEntity.ok(blog);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBlog(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        blogService.deleteBlog(id, username);
        return ResponseEntity.ok("Blog deleted successfully");
    }
}
