// src/app/services/blog-detail.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Blog, LikeResponse, Comment } from '../models/blog.model';

@Injectable({ providedIn: 'root' })
export class BlogDetailService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  getBlog(id: string) {
    return this.http.get<{ data: Blog }>(`${this.baseUrl}/blogs/${id}`);
  }

  getLikeStatus(blogId: string) {
    return this.http.get<{ data: { liked: boolean } }>(`${this.baseUrl}/likes/blogs/${blogId}`);
  }

  toggleLike(blogId: number) {
    return this.http.post<{ data: LikeResponse }>(`${this.baseUrl}/likes/blogs/${blogId}`, {});
  }

  getComments(blogId: string) {
    return this.http.get<Comment[]>(`${this.baseUrl}/comments/blogs/${blogId}`);
  }

  postComment(blogId: number, content: string) {
    return this.http.post<Comment>(`${this.baseUrl}/comments/blogs/${blogId}`, { content });
  }

  deleteComment(commentId: number) {
    return this.http.delete<void>(`${this.baseUrl}/comments/${commentId}`);
  }
}
