import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BlogDetailService } from '../../services/blog-detail.service';
import { BlogsService } from '../../services/blogs.service';
import { ReportDialog } from '../report-dialog/report-dialog';
import { Blog, Comment } from '../../models/blog.model';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,

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
  /* =======================
     CORE STATE
  ======================== */
  blog = signal<Blog | null>(null);
  loadingBlog = signal(true);
  blogError = signal<string | null>(null);

  /** 🔒 POST AVAILABILITY */
  isPostUnavailable = signal(false);

  /* =======================
     USER STATE
  ======================== */
  currentUserId = signal<number | null>(null);
  currentUsername = signal('');
  isAdmin = signal(false);

  /* =======================
     LIKE STATE
  ======================== */
  isLiked = signal(false);

  /* =======================
     COMMENTS STATE
  ======================== */
  comments = signal<Comment[]>([]);
  commentText = signal('');
  loadingComments = signal(false);
  postingComment = signal(false);
  commentsError = signal<string | null>(null);

  /* =======================
     MEDIA STATE
  ======================== */
  selectedMediaIndex = signal(0);

  mediaList = computed(() => this.getMediaArray().slice(0, 4));

  selectedMediaUrl = computed(
    () => this.mediaList()[this.selectedMediaIndex()] ?? null,
  );

  isSelectedVideo = computed(() => {
    const url = this.selectedMediaUrl();
    return !!url && /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(url);
  });

  // ✅ prevent snackbar spam (show once)
  private notFoundSnackShown = signal(false);

  /* =======================
     DEPENDENCIES
  ======================== */
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogDetailService);
  private blogsService = inject(BlogsService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  /* =======================
     INIT
  ======================== */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.loadUserInfo();

    // ✅ Load blog first; only after success load like/comments
    this.loadBlog(id);
  }

  /* =======================
     SNACKBAR HELPERS
  ======================== */
  private showErrorSnack(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  /* =======================
     ERROR HELPER
  ======================== */
  private extractErrorMessage(err: any, fallback: string): string {
    if (!err) return fallback;

    if (err.error) {
      if (typeof err.error.message === 'string') return err.error.message;
      if (typeof err.error.error === 'string') return err.error.error;
      if (Array.isArray(err.error.errors)) return err.error.errors.join(', ');
    }

    if (err.status === 0) return 'Cannot reach server';
    return fallback;
  }

  /* =======================
     USER INFO
  ======================== */
  loadUserInfo(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserId.set(user.id);
        this.currentUsername.set(user.username);
        this.isAdmin.set(String(user.role ?? '').toLowerCase() === 'admin');
        return;
      } catch {}
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUsername.set(payload.sub ?? '');
      this.isAdmin.set((payload.role ?? '').toLowerCase().includes('admin'));
    } catch {}
  }

  /* =======================
     PERMISSIONS
  ======================== */
  canEditBlog = computed(() => {
    const blog = this.blog();
    return (
      !!blog &&
      !this.isPostUnavailable() &&
      (blog.author?.id === this.currentUserId() ||
        blog.author?.username === this.currentUsername() ||
        this.isAdmin())
    );
  });

  canDeleteBlog = this.canEditBlog;

  canDeleteComment(comment: Comment): boolean {
    return (
      !this.isPostUnavailable() &&
      (comment.author.id === this.currentUserId() ||
        comment.author.username === this.currentUsername() ||
        this.isAdmin())
    );
  }

  /* =======================
     MEDIA HELPERS
  ======================== */
  private parseMediaString(media?: string | string[] | null): string[] {
    if (!media) return [];
    const BASE = 'http://localhost:8080';

    if (Array.isArray(media)) {
      return media.map((u) => (u.startsWith('http') ? u : BASE + u));
    }

    try {
      const parsed = JSON.parse(media);
      return Array.isArray(parsed)
        ? parsed.map((u) => (u.startsWith('http') ? u : BASE + u))
        : [];
    } catch {
      return [BASE + media];
    }
  }

  getMediaArray(): string[] {
    return this.parseMediaString(this.blog()?.media);
  }

  selectMedia(index: number): void {
    if (this.isPostUnavailable()) return;
    if (index >= 0 && index < this.mediaList().length) {
      this.selectedMediaIndex.set(index);
    }
  }

  /* =======================
     BLOG
  ======================== */
  loadBlog(id: string): void {
    this.loadingBlog.set(true);
    this.blogError.set(null);
    this.isPostUnavailable.set(false);
    this.notFoundSnackShown.set(false);

    this.blogService.getBlog(id).subscribe({
      next: (res) => {
        // optional hidden flag support
        if ((res.data as any)?.hidden === true) {
          this.isPostUnavailable.set(true);
          const msg = 'This post is hidden';
          this.blogError.set(msg);
          this.showErrorSnack(msg);
          this.loadingBlog.set(false);
          return;
        }

        this.blog.set(res.data);
        this.selectedMediaIndex.set(0);
        this.loadingBlog.set(false);

        // ✅ Now that blog exists, load like/comments
        this.checkLikeStatus(id);
        this.loadComments(id);
      },
      error: (err) => {
        this.isPostUnavailable.set(true);

        const msg =
          err.status === 404
            ? 'This post has been deleted or does not exist'
            : err.status === 403
              ? 'You do not have access to this post'
              : this.extractErrorMessage(err, 'Failed to load blog post');

        this.blogError.set(msg);

        // ✅ show snackbar for not found / forbidden / etc (only once)
        if (!this.notFoundSnackShown()) {
          this.showErrorSnack(msg);
          this.notFoundSnackShown.set(true);
        }

        this.loadingBlog.set(false);
      },
    });
  }

  editBlog(): void {
    if (this.isPostUnavailable()) return;
    const blog = this.blog();
    if (blog) this.router.navigate(['/blogs', blog.id, 'edit']);
  }

  deleteBlog(): void {
    if (this.isPostUnavailable()) return;

    const blog = this.blog();
    if (!blog) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '340px',
      data: { message: 'Are you sure you want to delete this post?' },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.blogService.deleteBlog(Number(blog.id)).subscribe({
        next: () => {
          this.snackBar.open('Post deleted', 'OK', { duration: 2000 });
          this.router.navigate(['/']);
        },
        error: (err) =>
          this.snackBar.open(
            this.extractErrorMessage(err, 'Failed to delete post'),
            'OK',
            { duration: 3000 },
          ),
      });
    });
  }

  /* =======================
     LIKE
  ======================== */
  checkLikeStatus(id: string): void {
    if (this.isPostUnavailable()) return;

    this.blogService.getLikeStatus(id).subscribe({
      next: (res) => this.isLiked.set(res.data.liked),
      error: () => this.isLiked.set(false),
    });
  }

  likeBlog(): void {
    if (this.isPostUnavailable()) return;

    const blog = this.blog();
    if (!blog) return;

    this.blogService.toggleLike(Number(blog.id)).subscribe({
      next: (res) => {
        this.isLiked.set(res.data.liked);
        this.blog.set({ ...blog, likeCount: res.data.likeCount });
      },
      error: (err) =>
        this.snackBar.open(
          this.extractErrorMessage(err, 'Failed to like post'),
          'OK',
          { duration: 3000 },
        ),
    });
  }

  /* =======================
     COMMENTS
  ======================== */
  loadComments(id: string): void {
    if (this.isPostUnavailable()) return;

    this.loadingComments.set(true);
    this.commentsError.set(null);

    this.blogService.getComments(id).subscribe({
      next: (res) => {
        this.comments.set(res);
        this.loadingComments.set(false);
      },
      error: (err) => {
        this.commentsError.set(
          this.extractErrorMessage(err, 'Failed to load comments'),
        );
        this.loadingComments.set(false);
      },
    });
  }

  // ✅ Updated: blocks spaces-only + prevents double submit + safer commentCount update
  postComment(): void {
    if (this.isPostUnavailable()) return;
    if (this.postingComment()) return;

    const blog = this.blog();
    const text = this.commentText().trim();

    if (!blog) return;

    if (!text) {
      this.snackBar.open('Comment cannot be empty', 'OK', { duration: 2500 });
      return;
    }

    this.postingComment.set(true);

    this.blogService.postComment(Number(blog.id), text).subscribe({
      next: () => {
        this.commentText.set('');

        this.blogService.getComments(String(blog.id)).subscribe({
          next: (comments) => {
            this.comments.set(comments);

            this.blog.update((b) =>
              b ? { ...b, commentCount: comments.length } : b,
            );

            this.postingComment.set(false);
          },
          error: (err) => {
            this.postingComment.set(false);
            this.snackBar.open(
              this.extractErrorMessage(err, 'Failed to refresh comments'),
              'OK',
              { duration: 3000 },
            );
          },
        });
      },
      error: (err) => {
        this.postingComment.set(false);
        this.snackBar.open(
          this.extractErrorMessage(err, 'Failed to post comment'),
          'OK',
          { duration: 3000 },
        );
      },
    });
  }

  deleteComment(commentId: number): void {
    if (this.isPostUnavailable()) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '320px',
      data: { message: 'Are you sure you want to delete this comment?' },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.blogService.deleteComment(commentId).subscribe({
        next: () => {
          this.comments.update((c) => c.filter((cm) => cm.id !== commentId));

          this.blog.update((b) =>
            b
              ? { ...b, commentCount: Math.max(0, (b.commentCount ?? 0) - 1) }
              : b,
          );

          this.snackBar.open('Comment deleted', 'OK', { duration: 2000 });
        },
        error: (err) =>
          this.snackBar.open(
            this.extractErrorMessage(err, 'Failed to delete comment'),
            'OK',
            { duration: 3000 },
          ),
      });
    });
  }

  /* =======================
     REPORT
  ======================== */
  openReportDialog(): void {
    if (this.isPostUnavailable()) return;

    const blog = this.blog();
    if (!blog) return;

    const ref = this.dialog.open(ReportDialog, {
      width: '480px',
      data: blog.id,
    });

    ref.afterClosed().subscribe((reason: string | null) => {
      if (reason) this.reportBlog(reason);
    });
  }

  reportBlog(reason: string): void {
    if (this.isPostUnavailable()) return;

    const blog = this.blog();
    if (!blog) return;

    this.blogsService.reportBlog(blog.id, reason).subscribe({
      next: () =>
        this.snackBar.open('Post reported successfully', 'OK', {
          duration: 3000,
        }),
      error: (err) =>
        this.snackBar.open(
          this.extractErrorMessage(err, 'Failed to report post'),
          'OK',
          { duration: 3000 },
        ),
    });
  }
}
