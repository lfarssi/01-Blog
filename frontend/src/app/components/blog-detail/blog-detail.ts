import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { BlogDetailService } from '../../services/blog-detail.service';
import { Blog, Comment } from '../../models/blog.model';
import { MatTooltip } from '@angular/material/tooltip';

interface DecodedToken {
  sub: string;
  role: string;
  userId: number;
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
    MatDividerModule,
    MatTooltip
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

  // User info signals
  currentUserId = signal<number | null>(null);
  currentUsername = signal<string>('');
  isAdmin = signal(false);

  // Computed signals for permissions
  canEditBlog = computed(() => {
    const blog = this.blog();
    if (!blog) return false;
    return this.isPostOwner(blog) || this.isAdmin();
  });

  canDeleteBlog = computed(() => {
    const blog = this.blog();
    if (!blog) return false;
    return this.isPostOwner(blog) || this.isAdmin();
  });

  // Inject dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogDetailService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // 1. FIRST: Load user info (immediate)
      this.loadUserInfo();

      // 2. THEN: Load blog (user info will be ready)
      this.loadBlog(id);

      // 3. Parallel: likes + comments
      this.checkLikeStatus(id);
      this.loadComments(id);
    }
  }

  loadUserInfo(): void {
    // 1. Get user info from localStorage current_user (has the ID!)
    const currentUserStr = localStorage.getItem('current_user');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        console.log('Current user:', currentUser);

        this.currentUserId.set(currentUser.id);
        this.currentUsername.set(currentUser.username);
        this.isAdmin.set(currentUser.role === 'admin');
      } catch {
        console.error('Failed to parse current_user');
      }
    }

    // 2. Fallback to JWT if no current_user
    const token = localStorage.getItem('token');
    if (!currentUserStr && token) {
      try {
        const payload: any = JSON.parse(atob(token.split('.')[1]));
        this.currentUsername.set(payload.sub || '');
        this.isAdmin.set((payload.role || '').toLowerCase().includes('admin'));
      } catch {
        console.error('Failed to decode token');
      }
    }
  }

  isPostOwner(blog: Blog): boolean {
    const userId = this.currentUserId();
    const username = this.currentUsername();

    return blog.author?.id === userId || blog.author?.username === username;
  }

  canDeleteComment(comment: Comment): boolean {
    const username = this.currentUsername();
    const userId = this.currentUserId();
    const isOwner = comment.author.username === username || comment.author.id === userId;
    return isOwner || this.isAdmin();
  }

private parseMediaString(media: string | string[] | undefined | null): string[] {
  if (!media) return [];

  const BACKEND_URL = 'http://localhost:8080';  // ✅ Your Spring Boot

  if (Array.isArray(media)) {
    return media.map(url => url.startsWith('http') ? url : `${BACKEND_URL}${url}`);
  }

  try {
    const parsed = JSON.parse(media as string);
    return Array.isArray(parsed) 
      ? parsed.map(url => url.startsWith('http') ? url : `${BACKEND_URL}${url}`)
      : [];
  } catch {
    return media ? [`${BACKEND_URL}${media}`] : [];
  }
}


  showFirstMedia(): string | null {
    const mediaArray = this.parseMediaString(this.blog()?.media);
    return mediaArray.length > 0 ? mediaArray[0] : null;
  }

  getMediaArray(): string[] {
    return this.parseMediaString(this.blog()?.media);
  }

  hasMedia(): boolean {
    return this.getMediaArray().length > 0;
  }

  isVideo(): boolean {
    const mediaUrl = this.showFirstMedia();
    if (!mediaUrl) return false;
    return /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(mediaUrl);
  }

  getMediaCount(): number {
    return this.getMediaArray().length;
  }

  loadBlog(id: string): void {
    this.blogService.getBlog(id).subscribe({
      next: (res) => {
        console.log('Blog data:', res.data); // ✅ Your debug log
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

    const blogId = Number(currentBlog.id);
    this.blogService.toggleLike(blogId).subscribe({
      next: (res) => {
        this.isLiked.set(res.data.liked);
        this.blog.set({
          ...currentBlog,
          likeCount: res.data.likeCount  // ✅ Backend field name
        } as Blog);
      },
      error: (err) => console.error('Toggle failed:', err)
    });
  }

  editBlog(): void {
    const currentBlog = this.blog();
    if (currentBlog) {
      this.router.navigate(['/blogs', currentBlog.id, 'edit']);
    }
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
    this.blogService.postComment(Number(currentBlog.id), text).subscribe({
      next: (res) => {
        this.comments.update(c => [res, ...c]);
        this.commentText.set('');
        this.postingComment.set(false);

        this.blog.set({
          ...currentBlog,
          commentCount: (currentBlog.commentCount || 0) + 1  // ✅ Backend field
        } as Blog);
      },
      error: (err) => {
        console.error('Failed to post comment', err);
        this.postingComment.set(false);
      }
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    const currentBlog = this.blog();

    this.blogService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update(c => c.filter(comment => comment.id !== commentId));

        if (currentBlog) {
          this.blog.set({
            ...currentBlog,
            commentCount: Math.max(0, (currentBlog.commentCount || 0) - 1)
          } as Blog);
        }
      },
      error: (err) => console.error('Failed to delete comment', err)
    });
  }

  deleteBlog(): void {
    const currentBlog = this.blog();
    if (!currentBlog) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    this.blogService.deleteBlog(Number(currentBlog.id)).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => console.error('Failed to delete post', err)
    });
  }

  getCurrentUsername(): string {
    return this.currentUsername();
  }
}
