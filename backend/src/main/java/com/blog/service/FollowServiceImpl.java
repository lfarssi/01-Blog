package com.blog.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.blog.dto.FollowResponse;
import com.blog.dto.FollowerListResponse;
import com.blog.entity.FollowEntity;
import com.blog.entity.UserEntity;
import com.blog.exception.ResourceNotFoundException;
import com.blog.mapper.FollowMapper;
import com.blog.repository.FollowRepository;
import com.blog.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowServiceImpl implements FollowService {

        private final FollowRepository followRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;

        @Override
        @Transactional
        public FollowResponse toggleFollow(Long targetUserId, String currentUsername) {
                UserEntity currentUser = userRepository.findByUsername(currentUsername)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                UserEntity targetUser = userRepository.findById(targetUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

                if (currentUser.getId().equals(targetUser.getId())) {
                        throw new IllegalArgumentException("Cannot follow yourself");
                }

                Optional<FollowEntity> existingFollow = followRepository
                                .findByFollower_IdAndFollowing_Id(currentUser.getId(), targetUser.getId());

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

                        notificationService.createNotification(
                                        targetUser.getId(), // receiver = person being followed
                                        "NEW_FOLLOWER",
                                        currentUser.getUsername() + " started following you",
                                        currentUser.getId() // relatedId = followerId (your choice)
                        );

                }

                Long followerCount = followRepository.countByFollowing_Id(targetUser.getId());
                Long followingCount = followRepository.countByFollower_Id(targetUser.getId());

                return new FollowResponse(following, followerCount, followingCount);
        }

        @Override
        public FollowResponse getFollowStatus(Long targetUserId, String currentUsername) {
                UserEntity currentUser = userRepository.findByUsername(currentUsername)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                UserEntity targetUser = userRepository.findById(targetUserId)
                                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

                boolean following = followRepository
                                .existsByFollower_IdAndFollowing_Id(currentUser.getId(), targetUser.getId());

                Long followerCount = followRepository.countByFollowing_Id(targetUser.getId());
                Long followingCount = followRepository.countByFollower_Id(targetUser.getId());

                return new FollowResponse(following, followerCount, followingCount);
        }

        @Override
        public List<FollowerListResponse> getFollowers(Long userId) {
                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                List<FollowEntity> follows = followRepository.findByFollowing_Id(user.getId());

                return follows.stream()
                                .map(follow -> FollowMapper.toFollowerResponse(follow.getFollower(), follow))
                                .toList();
        }

        @Override
        public List<FollowerListResponse> getFollowing(Long userId) {
                UserEntity user = userRepository.findById(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                List<FollowEntity> follows = followRepository.findByFollower_Id(user.getId());

                return follows.stream()
                                .map(follow -> FollowMapper.toFollowingResponse(follow.getFollowing(), follow))
                                .toList();
        }
}
