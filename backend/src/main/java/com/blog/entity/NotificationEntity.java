package com.blog.entity;

import java.time.Instant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

  private Instant createdAt;   // ✅ remove final
  private Instant updatedAt;
}
