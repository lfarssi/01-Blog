package com.blog.controller.admin;

import com.blog.dto.ApiResponse;
import com.blog.dto.BlogResponse;
import com.blog.service.admin.AdminBlogsService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/blogs") // final: /api/admin/blogs
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBlogsController {

  private final AdminBlogsService adminBlogsService;

  @GetMapping
  public ResponseEntity<Object> getAllBlogs() {
    List<BlogResponse> blogs = adminBlogsService.getAllBlogs();
    return ApiResponse.from(200, "Blogs Received successfully", blogs);
  }

  @DeleteMapping("/{blogId}")
  public ResponseEntity<Object> deleteBlog(@PathVariable Long blogId) {
    adminBlogsService.deleteBlog(blogId);
    return ApiResponse.from(204, "Blog deleted", null);
  }

  // ✅ Hide functionality REMOVED
@PatchMapping("/{blogId}/toggle-visible")
public ResponseEntity<Object> toggleVisible(@PathVariable Long blogId) {
    boolean visible = adminBlogsService.toggleVisible(blogId);
    return ApiResponse.from(200, visible ? "Blog visible" : "Blog hidden", visible);
}
}
