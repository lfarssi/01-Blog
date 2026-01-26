package com.blog.service.admin;

import java.util.List;

import com.blog.dto.BlogResponse;

public interface AdminBlogsService {
      List<BlogResponse> getAllBlogs();

  void deleteBlog(Long blogId);
  void setBlogVisibility(Long blogId, boolean visible);
}
