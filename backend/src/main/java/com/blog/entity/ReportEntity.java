package com.blog.entity;

import java.time.Instant;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

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
@Table(name="reports")
@Getter
@Setter
@Builder
public class ReportEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;


    @ManyToOne
    @JoinColumn(name = "reported_by_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private UserEntity reported_by_id;

    private Long target_id;

    private String reason;

    private String status;

    private String type;

    private final Instant createdAt;
    private final Instant updatedAt;
}
