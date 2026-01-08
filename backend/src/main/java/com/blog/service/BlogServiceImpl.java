package com.blog.service;

import org.springframework.stereotype.Service;

import com.blog.dto.BlogResponse;
import com.blog.mapper.BlogMapper;
import com.blog.entity.BlogEntity;
import com.blog.repository.BlogRepository;
import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
    private final BlogRepository blogRepository;

    @Override
    public BlogResponse getBlogDetails(Integer id){
        BlogEntity user = blogRepository.findById(id).orElseThrow(()-> new RuntimeException("Blog not found"));
        return  BlogMapper.toResponse(user);
    }
}
