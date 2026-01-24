// src/app/models/blog.model.ts
export interface Blog {
  id: number;
  title?: string;           
  content: string;          
  media?: string;           // ✅ Backend field name (was mediaUrl)
  mediaType?: 'image' | 'video' | 'none';
  likeCount: number;        // ✅ Backend field (was likeCount)
  commentCount: number;     // ✅ Backend field (was commentCount)
  createdAt: string;
  updatedAt: string;
    isLikedByCurrentUser: boolean;  // ✅ Add back!

  author: UserResponse;     // ✅ Full backend UserResponse
}

export interface UserResponse {  // ✅ Backend UserResponse
  id: number;
  username: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
}

// Backwards compatible Author (if needed elsewhere)
export type Author = Pick<UserResponse, 'id' | 'username' | 'email'>;

export interface LikeResponse {
  liked: boolean;
  likeCount: number;        // ✅ Backend field
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: UserResponse;     // ✅ Backend UserResponse
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  mediaFile?: File;
}

export interface UpdateBlogRequest {
  title?: string;
  content?: string;
}

export interface CreateCommentRequest {
  content: string;
}

// Remove isLikedByCurrentUser - use component signal instead
// isLikedByCurrentUser handled by isLiked signal in component

export interface BlogPage {
  blogs: Blog[];
}
