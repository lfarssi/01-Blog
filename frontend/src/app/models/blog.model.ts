// src/app/models/blog.model.ts
export interface Blog {
  id: number;
  title?: string;           // Optional for quick posts
  content: string;          // Main description/text
  mediaUrl?: string;        // URL for image/video (renamed from 'media')
  mediaType?: 'image' | 'video' | 'none';  // NEW: For media preview
  likesCount: number;       // Renamed from likeCount
  commentsCount: number;    // Renamed from commentCount
  createdAt: string;        // ISO string for date pipe
  updatedAt: string;
  isLikedByCurrentUser: boolean;  // NEW: For heart icon state
  author: Author;
}

export interface Author {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string;       // NEW: For profile pics
}

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
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

export interface BlogPage {
  blogs: Blog[];
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
}
