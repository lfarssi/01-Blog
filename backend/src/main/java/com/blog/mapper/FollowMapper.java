package com.blog.mapper;

import com.blog.dto.FollowerListResponse;
import com.blog.entity.FollowEntity;
import com.blog.entity.UserEntity;

public class FollowMapper {
    public static FollowerListResponse toFollowerResponse(UserEntity user, FollowEntity follow) {
        return new FollowerListResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                follow.getCreatedAt()
        );
    }

    public static FollowerListResponse toFollowingResponse(UserEntity user, FollowEntity follow) {
        return new FollowerListResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                follow.getCreatedAt()
        );
    }
}