package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blog.dto.FollowResponse;
import com.blog.dto.FollowerListResponse;
import com.blog.entity.FollowEntity;
import com.blog.entity.NotificationEntity;
import com.blog.entity.UserEntity;
import com.blog.mapper.FollowMapper;
import com.blog.repository.FollowRepository;
import com.blog.repository.NotificationRepository;
import com.blog.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public FollowResponse toggleFollow(String targetUsername, String username) {
        UserEntity currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserEntity targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        if (currentUser.getId().equals(targetUser.getId())) {
            throw new RuntimeException("Cannot follow yourself");
        }

        Optional<FollowEntity> existingFollow = followRepository.findByFollower_IdAndFollowing_Id(
                currentUser.getId(), targetUser.getId());

        boolean following;
        if (existingFollow.isPresent()) {
            followRepository.delete(existingFollow.get());
            following = false;
        } else {
            FollowEntity follow = FollowEntity.builder()
                    .follower(currentUser)
                    .following(targetUser)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            followRepository.save(follow);
            following = true;

            NotificationEntity notification = NotificationEntity.builder()
                    .user(targetUser)
                    .type("FOLLOW")
                    .content(currentUser.getUsername() + " started following you")
                    .relatedId(currentUser.getId())
                    .isRead(false)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();
            notificationRepository.save(notification);
        }

        Long followerCount = followRepository.countByFollowing_Id(targetUser.getId());
        Long followingCount = followRepository.countByFollower_Id(targetUser.getId());

        return new FollowResponse(following, followerCount, followingCount);
    }

    @Override
    public FollowResponse getFollowStatus(String targetUsername, String username) {
        UserEntity currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserEntity targetUser = userRepository.findByUsername(targetUsername)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        boolean following = followRepository.existsByFollower_IdAndFollowing_Id(
                currentUser.getId(), targetUser.getId());

        Long followerCount = followRepository.countByFollowing_Id(targetUser.getId());
        Long followingCount = followRepository.countByFollower_Id(targetUser.getId());

        return new FollowResponse(following, followerCount, followingCount);
    }

    @Override
    public List<FollowerListResponse> getFollowers(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FollowEntity> follows = followRepository.findByFollowing_Id(user.getId());

        return follows.stream()
                .map(follow -> FollowMapper.toFollowerResponse(follow.getFollower(), follow))
                .collect(Collectors.toList());
    }

    @Override
    public List<FollowerListResponse> getFollowing(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FollowEntity> follows = followRepository.findByFollower_Id(user.getId());

        return follows.stream()
                .map(follow -> FollowMapper.toFollowingResponse(follow.getFollowing(), follow))
                .collect(Collectors.toList());
    }
}
