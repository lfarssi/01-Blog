import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BlogDetailService } from '../../services/blog-detail.service';
import { BlogsService } from '../../services/blogs.service';
import { ReportDialog } from '../report-dialog/report-dialog';
import { Blog, Comment } from '../../models/blog.model';

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
    MatTooltipModule,
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

  // Gallery state (max 4 media)
  selectedMediaIndex = signal(0);

  // Media list (parsed + limited to 4)
  mediaList = computed(() => this.getMediaArray().slice(0, 4));

  // Currently selected media url
  selectedMediaUrl = computed(() => this.mediaList()[this.selectedMediaIndex()] ?? null);

  // Is selected media a video?
  isSelectedVideo = computed(() => {
    const url = this.selectedMediaUrl();
    return !!url && /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(url);
  });

  // Inject dependencies
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogDetailService);
  private blogsService = inject(BlogsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUserInfo();
      this.loadBlog(id);
      this.checkLikeStatus(id);
      this.loadComments(id);
    }
  }

  loadUserInfo(): void {
    const currentUserStr = localStorage.getItem('current_user');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        this.currentUserId.set(currentUser.id);
        this.currentUsername.set(currentUser.username);
        this.isAdmin.set(currentUser.role === 'admin');
      } catch {
        console.error('Failed to parse current_user');
      }
    }

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

  canDeleteComment(comment: Comment): boolean {
    const username = this.currentUsername();
    const userId = this.currentUserId();
    const isOwner = comment.author.username === username || comment.author.id === userId;
    return isOwner || this.isAdmin();
  }

  private parseMediaString(media: string | string[] | undefined | null): string[] {
    if (!media) return [];
    const BACKEND_URL = 'http://localhost:8080';

    if (Array.isArray(media)) {
      return media.map((url) => (url.startsWith('http') ? url : `${BACKEND_URL}${url}`));
    }

    try {
      const parsed = JSON.parse(media as string);
      return Array.isArray(parsed)
        ? parsed.map((url) => (url.startsWith('http') ? url : `${BACKEND_URL}${url}`))
        : [];
    } catch {
      return media ? [`${BACKEND_URL}${media}`] : [];
    }
  }

  showFirstMedia(): string | null {
    return this.selectedMediaUrl() ?? null;
  }

  getMediaArray(): string[] {
    return this.parseMediaString(this.blog()?.media);
  }

  hasMedia(): boolean {
    return this.mediaList().length > 0;
  }

  isVideo(): boolean {
    return this.isSelectedVideo();
  }

  getMediaCount(): number {
    return this.mediaList().length;
  }

  selectMedia(index: number): void {
    const list = this.mediaList();
    if (index < 0 || index >= list.length) return;
    this.selectedMediaIndex.set(index);
  }

  loadBlog(id: string): void {
    this.blogService.getBlog(id).subscribe({
      next: (res) => {
        this.blog.set(res.data);
        this.loading.set(false);
        this.selectedMediaIndex.set(0);
      },
      error: () => {
        this.error.set('Failed to load blog post');
        this.loading.set(false);
      },
    });
  }

  checkLikeStatus(id: string): void {
    this.blogService.getLikeStatus(id).subscribe({
      next: (res) => this.isLiked.set(res.data.liked),
      error: (err) => console.error('Failed to check like status', err),
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
          likeCount: res.data.likeCount,
        } as Blog);
      },
      error: (err) => console.error('Toggle failed:', err),
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
      },
    });
  }

  postComment(): void {
    const currentBlog = this.blog();
    const text = this.commentText().trim();
    if (!currentBlog || !text) return;

    this.postingComment.set(true);
    this.blogService.postComment(Number(currentBlog.id), text).subscribe({
      next: (res) => {
        this.comments.update((c) => [res, ...c]);
        this.commentText.set('');
        this.postingComment.set(false);

        this.blog.set({
          ...currentBlog,
          commentCount: (currentBlog.commentCount || 0) + 1,
        } as Blog);
      },
      error: (err) => {
        console.error('Failed to post comment', err);
        this.postingComment.set(false);
      },
    });
  }

  deleteComment(commentId: number): void {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    const currentBlog = this.blog();

    this.blogService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update((c) => c.filter((comment) => comment.id !== commentId));

        if (currentBlog) {
          this.blog.set({
            ...currentBlog,
            commentCount: Math.max(0, (currentBlog.commentCount || 0) - 1),
          } as Blog);
        }
      },
      error: (err) => console.error('Failed to delete comment', err),
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
      error: (err) => console.error('Failed to delete post', err),
    });
  }

  getCurrentUsername(): string {
    return this.currentUsername();
  }

  // NEW: Report functionality (complete)
  openReportDialog(): void {
    const dialogRef = this.dialog.open(ReportDialog, {
      width: '480px',
      data: this.blog()?.id!
    });

    dialogRef.afterClosed().subscribe((reason: string | null) => {
      if (reason) {
        this.reportBlog(reason);
      }
    });
  }

  reportBlog(reason: string): void {
    const blogId = this.blog()?.id!;
    this.blogsService.reportBlog(blogId, reason).subscribe({
      next: () => {
        this.snackBar.open('Post reported successfully', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open('Failed to report post', 'OK', { duration: 3000 });
      }
    });
  }
}
