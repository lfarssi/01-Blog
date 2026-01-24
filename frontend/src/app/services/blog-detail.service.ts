// src/app/services/blog-detail.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Blog, LikeResponse, Comment } from '../models/blog.model';
import { BASE_URL } from './env';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BlogDetailService {
  private http = inject(HttpClient);

  getBlog(id: string): Observable<{ data: Blog }> {
    return this.http.get<{ data: Blog }>(`${BASE_URL}/blogs/${id}`);
  }

  deleteBlog(id: number): Observable<any> {
    return this.http.delete(`${BASE_URL}/blogs/${id}`);
  }

  getLikeStatus(blogId: string): Observable<{ data: { liked: boolean } }> {
    return this.http.get<{ data: { liked: boolean } }>(`${BASE_URL}/likes/blogs/${blogId}`);
  }

  toggleLike(blogId: number): Observable<{ data: LikeResponse }> {
    return this.http.post<{ data: LikeResponse }>(`${BASE_URL}/likes/blogs/${blogId}`, {});
  }

  getComments(blogId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${BASE_URL}/comments/blogs/${blogId}`);
  }

  postComment(blogId: number, content: string): Observable<Comment> {
    return this.http.post<Comment>(`${BASE_URL}/comments/blogs/${blogId}`, { content });
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${BASE_URL}/comments/${commentId}`);
  }
}
