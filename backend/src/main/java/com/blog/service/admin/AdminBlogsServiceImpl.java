package com.blog.service.admin;

import com.blog.dto.BlogResponse;
import com.blog.entity.BlogEntity;
import com.blog.mapper.BlogMapper;
import com.blog.repository.BlogRepository;
import com.blog.repository.CommentRepository;
import com.blog.repository.ReportRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AdminBlogsServiceImpl implements AdminBlogsService {

    private final BlogRepository blogRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;

    @Override
    public List<BlogResponse> getAllBlogs() {
        return blogRepository.findAll().stream()
                .map(BlogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteBlog(Long blogId) {
        blogRepository.findById(blogId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));

        // delete related content first (FK safety)
        commentRepository.deleteAllByBlog_Id(blogId);

        // your ReportEntity uses targetId + type
        reportRepository.deleteAllByTargetIdAndType(blogId, "BLOG"); // or "POST"

        blogRepository.deleteById(blogId);
    }

    @Override
    @Transactional
    public boolean toggleVisible(Long blogId) {
        BlogEntity blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        blog.setVisible(!blog.getVisible());
        blogRepository.save(blog);

        return blog.getVisible();
    }

}
