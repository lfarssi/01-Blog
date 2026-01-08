package com.blog.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.BlogResponse;
import com.blog.service.BlogService;


@RestController
@RequestMapping("/blogs")
public class BlogController {
    @Autowired
    private BlogService blogService;
    @GetMapping
    public ResponseEntity<List<BlogResponse>> getAllBlogs(){
        List<BlogResponse> blogs=blogService.getAllBlogs();
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlog(@PathVariable Integer id){
        return ResponseEntity.ok(blogService.getBlogDetails(id));
    }
}
