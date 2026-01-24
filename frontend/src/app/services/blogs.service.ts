import { Injectable, inject, signal } from '@angular/core';
import { HttpClient ,HttpParams} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  Blog,
  Comment,
  CreateCommentRequest,
  LikeResponse,
} from '../models/blog.model';
import { BASE_URL } from './env';
import { ApiResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE_URL}/blogs`;

  likedBlogIds = signal<Set<number>>(new Set());

  getAllBlogs(): Observable<Blog[]> {

    return this.http.get<Blog[]>(this.apiUrl);
  }

  getFollowingBlogs(page: number, size: number): Observable<any> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<any>(`${this.apiUrl}/following`, { params });
  }

// blogs.service.ts
// blogs.service.ts
getBlogsByUser(userId: number, page: number = 0, size: number = 10): Observable<any> {
  return this.http.get(`${this.apiUrl}/user/${userId}?page=${page}&size=${size}`);
}



  getBlogById(blogId: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${blogId}`);
  }

  createBlog(formData: FormData): Observable<ApiResponse<Blog>> {
    return this.http.post<ApiResponse<Blog>>(this.apiUrl, formData);
  }

  updateBlog(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, formData);
  }
  deleteBlog(blogId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blogId}`);
  }

  likeBlog(blogId: number): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${this.apiUrl}/${blogId}/like`, {}).pipe(
      tap((response) => {
        if (response.liked) {
          const currentLiked = this.likedBlogIds();
          const updated = new Set(currentLiked);
          updated.add(blogId);
          this.likedBlogIds.set(updated);
        }
      }),
    );
  }

  unlikeBlog(blogId: number): Observable<LikeResponse> {
    return this.http.delete<LikeResponse>(`${this.apiUrl}/${blogId}/like`).pipe(
      tap((response) => {
        if (!response.liked) {
          const currentLiked = this.likedBlogIds();
          const updated = new Set(currentLiked);
          updated.delete(blogId);
          this.likedBlogIds.set(updated);
        }
      }),
    );
  }

  toggleLike(blogId: number): Observable<LikeResponse> {
    if (this.isLikedCached(blogId)) {
      return this.unlikeBlog(blogId);
    } else {
      return this.likeBlog(blogId);
    }
  }

  getComments(blogId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/${blogId}/comments`);
  }

  addComment(blogId: number, request: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/${blogId}/comments`, request);
  }

  updateComment(
    blogId: number,
    commentId: number,
    request: CreateCommentRequest,
  ): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${blogId}/comments/${commentId}`, request);
  }

  deleteComment(blogId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blogId}/comments/${commentId}`);
  }

  searchBlogs(query: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/search`, {
      params: { q: query },
    });
  }

  getAllBlogsAdmin(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/admin/all`);
  }

  deleteBlogAdmin(blogId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${blogId}`);
  }

  loadLikedBlogs(): void {
    this.http.get<number[]>(`${this.apiUrl}/liked`).subscribe({
      next: (likedIds) => {
        this.likedBlogIds.set(new Set(likedIds));
      },
    });
  }

  isLikedCached(blogId: number): boolean {
    return this.likedBlogIds().has(blogId);
  }

  updateBlogLikeStatus(blogs: Blog[], blogId: number, likeResponse: LikeResponse): Blog[] {
    return blogs.map((blog) => {
      if (blog.id === blogId) {
        return {
          ...blog,
          likeCount: likeResponse.likeCount,
        };
      }
      return blog;
    });
  }

  updateBlogCommentCount(blogs: Blog[], blogId: number, increment: boolean): Blog[] {
    return blogs.map((blog) => {
      if (blog.id === blogId) {
        return {
          ...blog,
          commentCount: increment ? blog.commentCount + 1 : blog.commentCount - 1,
        };
      }
      return blog;
    });
  }
}
