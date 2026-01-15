import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { BlogDetailService } from '../../services/blog-detail.service';
import { Blog, Comment } from '../../models/blog.model';

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
    MatDividerModule,
    
  ],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss',
})
export class BlogDetail implements OnInit {
  // Signals for reactive state
  blog = signal<Blog | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isLiked = signal(false);
  
  commentText = signal('');
  comments = signal<Comment[]>([]);
  loadingComments = signal(false);
  postingComment = signal(false);

  // Inject dependencies
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogDetailService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBlog(id);
      this.checkLikeStatus(id);
      this.loadComments(id);
    }
  }

  loadBlog(id: string): void {
    this.blogService.getBlog(id).subscribe({
      next: (res) => {
        this.blog.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load blog post');
        this.loading.set(false);
      }
    });
  }

  checkLikeStatus(id: string): void {
    this.blogService.getLikeStatus(id).subscribe({
      next: (res) => this.isLiked.set(res.data.liked),
      error: (err) => console.error('Failed to check like status', err)
    });
  }

  likeBlog(): void {
    const currentBlog = this.blog();
    if (!currentBlog) return;

    this.blogService.toggleLike(currentBlog.id).subscribe({
      next: (res) => {
        this.isLiked.set(res.data.liked);
        this.blog.update(b => b ? { ...b, likeCount: res.data.likeCount } : null);
      },
      error: (err) => console.error('Failed to toggle like', err)
    });
  }

  loadComments(id: string): void {
    this.loadingComments.set(true);
    this.blogService.getComments(id).subscribe({
      next: (res) => {
        this.comments.set(res);
        this.loadingComments.set(false);
      },
      error: (err) => {
        console.error('Failed to load comments', err);
        this.loadingComments.set(false);
      }
    });
  }

  postComment(): void {
    const currentBlog = this.blog();
    const text = this.commentText().trim();
    if (!currentBlog || !text) return;

    this.postingComment.set(true);
    this.blogService.postComment(currentBlog.id, text).subscribe({
      next: (res) => {
        this.comments.update(c => [res, ...c]);
        this.commentText.set('');
        this.postingComment.set(false);
        this.blog.update(b => b ? { ...b, commentCount: b.commentCount + 1 } : null);
      },
      error: (err) => {
        console.error('Failed to post comment', err);
        this.postingComment.set(false);
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.blogService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update(c => c.filter(comment => comment.id !== commentId));
        this.blog.update(b => b ? { ...b, commentCount: b.commentCount - 1 } : null);
      },
      error: (err) => console.error('Failed to delete comment', err)
    });
  }

  getCurrentUsername(): string {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
      } catch {
        return '';
      }
    }
    return '';
  }
}
