package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.blog.dto.CommentRequest;
import com.blog.dto.CommentResponse;
import com.blog.entity.BlogEntity;
import com.blog.entity.CommentEntity;
import com.blog.entity.UserEntity;
import com.blog.exception.AccessDeniedException;
import com.blog.exception.ResourceNotFoundException;
import com.blog.mapper.CommentMapper;
import com.blog.repository.BlogRepository;
import com.blog.repository.CommentRepository;
import com.blog.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {
        private final CommentRepository commentRepository;
        private final UserRepository userRepository;
        private final BlogRepository blogRepository;
        @Autowired
        private NotificationServiceImpl notificationService;

        @Override
        @Transactional
        public CommentResponse createComment(Long blogId, CommentRequest request, String username) {
                UserEntity user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                BlogEntity blog = blogRepository.findById(blogId)
                                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

                CommentEntity comment = CommentEntity.builder()
                                .blog(blog)
                                .user(user)
                                .content(request.content())
                                .createdAt(Instant.now())
                                .updatedAt(Instant.now())
                                .build();

                comment = commentRepository.save(comment);

                // Update comment count
                blog.setComment_count(commentRepository.countByBlog_Id(blogId));
                blogRepository.save(blog);

                // Create notification if not self-comment
                if (!blog.getUserId().getId().equals(user.getId())) {
                        notificationService.createNotification(
                                        blog.getUserId().getId(), // receiver = blog owner
                                        "NEW_COMMENT",
                                        user.getUsername() + " commented on your blog",
                                        blogId // relatedId = blogId
                        );
                }

                return CommentMapper.toResponse(comment);
        }

        @Override
        public List<CommentResponse> getCommentsByBlogId(Long blogId) {
                List<CommentEntity> comments = commentRepository.findByBlog_Id(blogId);

                return comments.stream()
                                .map(CommentMapper::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void deleteComment(Long commentId, String username) {
                UserEntity user = userRepository.findByUsername(username)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                CommentEntity comment = commentRepository.findById(commentId)
                                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

                // Fix: Compare user objects, not user with Long ID
                if (!comment.getUser().getId().equals(user.getId())) {
                        throw new AccessDeniedException("Unauthorized to delete this comment");
                }

                Long blogId = comment.getBlog().getId();
                commentRepository.delete(comment);

                // Update comment count
                BlogEntity blog = blogRepository.findById(blogId)
                                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
                blog.setComment_count(commentRepository.countByBlog_Id(blogId));
                blogRepository.save(blog);
        }
}
