package com.blog.entity;

import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="blogs")
@Getter
@Setter
@Builder
@AllArgsConstructor
public class BlogEntity {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    private String title;

    private String content;

    private Long user_id;

    private String media;

    private Long like_count;

    private Long comment_count;


    private final Instant createdAt;
    private  Instant updatedAt;
}
