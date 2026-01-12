package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.ApiResponse;

import com.blog.dto.BlogRequest;
import com.blog.dto.BlogResponse;
import com.blog.dto.BlogUpdateRequest;
import com.blog.service.BlogService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin(origins = "http://localhost:4200") // <-- add this

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
    public ResponseEntity<Object> getBlog(@PathVariable Long id) {
        return  ApiResponse.from(200, "Blog Received successfully", blogService.getBlogDetails(id));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<Object> getBlogsByUser(@PathVariable String username) {
        List<BlogResponse> blogs = blogService.getBlogsByUser(username);
        return  ApiResponse.from(200, "Blogs Received successfully", blogs);
    }

    @PostMapping
    public ResponseEntity<Object> createBlog(
            @Valid @RequestBody BlogRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        BlogResponse blog = blogService.createBlog(request, username);
        return  ApiResponse.from(200, "Blog Created successfully", blog);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateBlog(
            @PathVariable Long id,
            @RequestBody BlogUpdateRequest request,
            Authentication authentication) {

        String username = authentication.getName();
        BlogResponse blog = blogService.updateBlog(id, request, username);
        return  ApiResponse.from(200, "Blog Updated successfully", blog);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteBlog(
            @PathVariable Long id,
            Authentication authentication) {

        String username = authentication.getName();
        blogService.deleteBlog(id, username);
        return  ApiResponse.from(200, "Blog Deleted successfully", null);
    }
}
