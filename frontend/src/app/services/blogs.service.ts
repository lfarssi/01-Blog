import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Blog, BlogPage, Comment, CreateBlogRequest, CreateCommentRequest, LikeResponse, UpdateBlogRequest } from '../models/blog.model';
import { BASE_URL } from './env';



@Injectable({
  providedIn: 'root'
})
export class BlogsService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE_URL}/blogs`;

  likedBlogIds = signal<Set<number>>(new Set());

  getAllBlogs(page: number = 0, size: number = 20): Observable<BlogPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<BlogPage>(this.apiUrl, { params });
  }

  getFollowingBlogs(page: number = 0, size: number = 20): Observable<BlogPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<BlogPage>(`${this.apiUrl}/following`, { params });
  }

  getBlogsByUserId(userId: number): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}/user/${userId}`);
  }

  getBlogById(blogId: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${blogId}`);
  }

  createBlog(request: CreateBlogRequest): Observable<Blog> {
    const formData = new FormData();
    formData.append('title', request.title);
    formData.append('content', request.content);
    
    if (request.mediaFile) {
      formData.append('media', request.mediaFile);
    }
    
    return this.http.post<Blog>(this.apiUrl, formData);
  }

  updateBlog(blogId: number, request: UpdateBlogRequest): Observable<Blog> {
    return this.http.put<Blog>(`${this.apiUrl}/${blogId}`, request);
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
      })
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
      })
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

  updateComment(blogId: number, commentId: number, request: CreateCommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${blogId}/comments/${commentId}`, request);
  }

  deleteComment(blogId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${blogId}/comments/${commentId}`);
  }

  searchBlogs(query: string, page: number = 0, size: number = 20): Observable<BlogPage> {
    const params = new HttpParams()
      .set('q', query)
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<BlogPage>(`${this.apiUrl}/search`, { params });
  }

  getAllBlogsAdmin(page: number = 0, size: number = 20): Observable<BlogPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<BlogPage>(`${this.apiUrl}/admin/all`, { params });
  }

  deleteBlogAdmin(blogId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${blogId}`);
  }

  loadLikedBlogs(): void {
    this.http.get<number[]>(`${this.apiUrl}/liked`).subscribe({
      next: (likedIds) => {
        this.likedBlogIds.set(new Set(likedIds));
      }
    });
  }

  isLikedCached(blogId: number): boolean {
    return this.likedBlogIds().has(blogId);
  }

  updateBlogLikeStatus(blogs: Blog[], blogId: number, likeResponse: LikeResponse): Blog[] {
    return blogs.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          likeCount: likeResponse.likesCount
        };
      }
      return blog;
    });
  }

  updateBlogCommentCount(blogs: Blog[], blogId: number, increment: boolean): Blog[] {
    return blogs.map(blog => {
      if (blog.id === blogId) {
        return {
          ...blog,
          commentCount: increment ? blog.commentsCount + 1 : blog.commentsCount - 1
        };
      }
      return blog;
    });
  }
}
