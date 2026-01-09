package com.blog.entity;
import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="notifications")
@Getter
@Setter
@Builder
public class NotificationEntity {
      @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

     @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private Boolean status;
    private String type;

    private String content;

    private Long relatedId;

    private Boolean isRead;


    private final Instant createdAt;
    private Instant updatedAt;
}
