package com.blog.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.blog.dto.BlogResponse;
import com.blog.service.BlogService;


@RestController
@RequestMapping("/api/blogs")
public class BlogController {
    @Autowired
    BlogService blogService;

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponse> getBlog(@PathVariable Integer id){
        return ResponseEntity.ok(blogService.getBlogDetails(id));
    }
}
