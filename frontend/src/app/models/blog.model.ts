// src/app/models/blog.model.ts
export interface Blog {
  id: number;
  title: string;
  content: string;
  media: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: Author;
}

export interface Author {
  id: number;
  username: string;
  email: string;
}

export interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
}
