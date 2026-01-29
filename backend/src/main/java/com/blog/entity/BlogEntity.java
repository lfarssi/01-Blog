package com.blog.entity;

import java.time.Instant;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "blogs")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED) // or PUBLIC

@AllArgsConstructor
public class BlogEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity userId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "media", columnDefinition = "json")
    private String media; // JSON array string

    @Builder.Default
    private Boolean visible = true;

    @PrePersist
    private void onCreate() {
        this.createdAt = Instant.now();
    }

    private Long like_count;

    private Long comment_count;

    private Instant createdAt;
    private Instant updatedAt;
}
