package com.blog.entity;
import java.time.Instant;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    private Boolean status;

    private final Instant createdAt =Instant.now();
    private final Instant updatedAt =Instant.now();
}
