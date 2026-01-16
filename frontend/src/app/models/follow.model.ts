export interface Follower {
  id: number;
  userId: number;
  username: string;
  avatarUrl?: string;
  followedAt: Date;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface FollowResponse {
  following: boolean;
  followerCount: number;
  followingCount: number;
}