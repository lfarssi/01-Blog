package com.blog.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.entity.BlogEntity;
import com.blog.entity.CommentEntity;
import com.blog.entity.UserEntity;
import com.blog.mapper.CommentMapper;
import com.blog.repository.BlogRepository;
import com.blog.repository.CommentRepository;
import com.blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final BlogRepository blogRepository;

    @Override
    @Transactional
    public CommentResponse createComment(Long blogId, CommentRequest request, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BlogEntity blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));

        CommentEntity comment = CommentEntity.builder()
                .blog_id(blogId)
                .user_id(user.getId())
                .content(request.content())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        comment = commentRepository.save(comment);

        blog.setComment_count(commentRepository.countByBlog_id(blogId));
        blogRepository.save(blog);

        return CommentMapper.toResponse(comment, user);
    }

    @Override
    public List<CommentResponse> getCommentsByBlogId(Long blogId) {
        List<CommentEntity> comments = commentRepository.findByBlog_id(blogId);

        return comments.stream()
                .map(comment -> {
                    UserEntity user = userRepository.findById(comment.getUser_id())
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    return CommentMapper.toResponse(comment, user);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUser_id().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }

        Long blogId = comment.getBlog_id();
        commentRepository.delete(comment);

        BlogEntity blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found"));
        blog.setComment_count(commentRepository.countByBlog_id(blogId));
        blogRepository.save(blog);
    }
}
