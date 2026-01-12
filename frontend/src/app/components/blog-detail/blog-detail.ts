import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface Blog {
  id: number;
  title: string;
  content: string;
  media: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    email: string;
  };
}

interface LikeResponse {
  liked: boolean;
  likeCount: number;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    email: string;
  };
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss',
})
export class BlogDetail implements OnInit {
  blog: Blog | null = null;
  loading = true;
  error: string | null = null;
  isLiked = false;
  
  // Comment properties
  commentText = '';
  comments: Comment[] = [];
  loadingComments = false;
  postingComment = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.loadBlog(id);
      this.checkLikeStatus(id);
      this.loadComments(id);
    }
  }

  loadBlog(id: string): void {
    this.http.get<any>(`http://localhost:8080/api/blogs/${id}`)
      .subscribe({
        next: (res) => {
          this.blog = res.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load blog post';
          this.loading = false;
        }
      });
  }

  checkLikeStatus(id: string): void {
    this.http.get<any>(`http://localhost:8080/api/likes/blogs/${id}`)
      .subscribe({
        next: (res) => {
          this.isLiked = res.data.liked;
        },
        error: (err) => {
          console.error('Failed to check like status', err);
        }
      });
  }

  likeBlog(): void {
    if (!this.blog) return;

    this.http.post<any>(`http://localhost:8080/api/likes/blogs/${this.blog.id}`, {})
      .subscribe({
        next: (res) => {
          this.isLiked = res.data.liked;
          if (this.blog) {
            this.blog.likeCount = res.data.likeCount;
          }
        },
        error: (err) => {
          console.error('Failed to toggle like', err);
        }
      });
  }

  loadComments(id: string): void {
    this.loadingComments = true;
    this.http.get<Comment[]>(`http://localhost:8080/api/comments/blogs/${id}`)
      .subscribe({
        next: (res) => {
          this.comments = res;
          this.loadingComments = false;
        },
        error: (err) => {
          console.error('Failed to load comments', err);
          this.loadingComments = false;
        }
      });
  }

  postComment(): void {
    if (!this.blog || !this.commentText.trim()) return;

    this.postingComment = true;
    const request = { content: this.commentText };

    this.http.post<Comment>(`http://localhost:8080/api/comments/blogs/${this.blog.id}`, request)
      .subscribe({
        next: (res) => {
          this.comments.unshift(res);
          this.commentText = '';
          this.postingComment = false;
          if (this.blog) {
            this.blog.commentCount++;
          }
        },
        error: (err) => {
          console.error('Failed to post comment', err);
          this.postingComment = false;
        }
      });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.http.delete<any>(`http://localhost:8080/api/comments/${commentId}`)
      .subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== commentId);
          if (this.blog) {
            this.blog.commentCount--;
          }
        },
        error: (err) => {
          console.error('Failed to delete comment', err);
        }
      });
  }

  getCurrentUsername(): string {
    // You might want to store this in a service or get it from JWT
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
      } catch (e) {
        return '';
      }
    }
    return '';
  }
}
