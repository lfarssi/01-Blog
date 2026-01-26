import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  DestroyRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

/* Services */
import { UserService } from '../../services/user.serivce';
import { BlogsService } from '../../services/blogs.service';
import { FollowService } from '../../services/follow.serivce';
import { ReportService } from '../../services/report.serivce';

/* Dialog */
import { ReportDialog } from '../report-dialog/report-dialog'; // Adjust path

/* Directive */
import { InfiniteListDirective } from '../../directives/infinite-list';

/* Models */
import { User } from '../../models/user.model';
import { Blog } from '../../models/blog.model';
import { FollowResponse } from '../../models/follow.model';

/* Angular Material */
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, // ✅ Added for MatDialog
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatTooltipModule,
    InfiniteListDirective,
    MatProgressSpinnerModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog); // ✅ Added MatDialog

  private userService = inject(UserService);
  private blogsService = inject(BlogsService);
  private followService = inject(FollowService);
  private reportService = inject(ReportService);

  private currentUserId = signal(-1);

  /* ---------------- Core Signals ---------------- */
  user = signal<User | null>(null);
  blogs = signal<Blog[]>([]);
  followStatus = signal<FollowResponse | null>(null);

  /* ---------------- Infinite Scroll ---------------- */
  blogsPage = signal(0);
  blogsLoadingMore = signal(false);
  hasMoreBlogs = signal(true);

  /* ---------------- UI State ---------------- */
  isOwnProfile = signal(false);
  isLoading = signal(true);
  hasAlreadyReported = signal(false);

  /* ---------------- Followers / Following ---------------- */
  showFollowersDialog = signal(false);
  showFollowingDialog = signal(false);

  followers = signal<User[]>([]);
  following = signal<User[]>([]);

  followersLoading = signal(false);
  followingLoading = signal(false);

  /* ---------------- Computed ---------------- */
  blogsCount = computed(() => this.blogs().length);

  hasNoBlogs = computed(
    () => !this.isLoading() && this.blogs().length === 0 && !this.blogsLoadingMore(),
  );

  isFollowing = computed(() => this.followStatus()?.following ?? false);
  followersCount = computed(() => this.followStatus()?.followerCount ?? 0);
  followingCount = computed(() => this.followStatus()?.followingCount ?? 0);

  /* ---------------- Lifecycle ---------------- */
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const userId = Number(params.get('id'));
      if (!userId) {
        this.router.navigate(['/']);
        return;
      }

      this.resetProfileState();
      this.loadProfile(userId);
    });
  }

  private async resetProfileState(): Promise<void> {
    this.isLoading.set(true);
    this.user.set(null);
    this.blogs.set([]);
    this.blogsPage.set(0);
    this.hasMoreBlogs.set(true);
  }

  private async loadProfile(userId: number): Promise<void> {
    try {
      const user = await firstValueFrom(this.userService.getUserById(userId));
      this.user.set(user);

      const currentId = await firstValueFrom(this.userService.getCurrentUserId());
      this.currentUserId.set(currentId);
      this.isOwnProfile.set(user.id === currentId);

      this.loadFollowStatus(userId);
      this.checkReportStatus(userId);
      this.loadMoreBlogs();

      this.isLoading.set(false);
    } catch {
      this.isLoading.set(false);
    }
  }

  /* ---------------- Blogs ---------------- */
  loadMoreBlogs(): void {
    if (this.blogsLoadingMore() || !this.hasMoreBlogs() || !this.user()) return;

    this.blogsLoadingMore.set(true);
    const nextPage = this.blogsPage();

    this.blogsService
      .getBlogsByUser(this.user()!.id, nextPage, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const newBlogs = response.data || response;
          this.blogs.update((prev) => [...prev, ...newBlogs]);
          this.blogsPage.set(nextPage);
          this.hasMoreBlogs.set(newBlogs.length === 10);
          this.blogsLoadingMore.set(false);
        },
        error: () => this.blogsLoadingMore.set(false),
      });
  }

  /* ---------------- Follow / Report ---------------- */
  private loadFollowStatus(userId: number): void {
    this.followService
      .getFollowStatus(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => this.followStatus.set(status));
  }

private checkReportStatus(userId: number): void {
  
  this.reportService
    .hasReportedUser(userId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({next: (response: any) =>this.hasAlreadyReported.set(response.data)});
}


  toggleFollow(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.followService
      .toggleFollow(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => this.followStatus.set(status));
  }

  /* ---------------- Followers / Following ---------------- */
  openFollowers(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.showFollowersDialog.set(true);
    this.followersLoading.set(true);

    this.followService
      .getFollowers(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.followers.set(users);
          this.followersLoading.set(false);
        },
        error: () => this.followersLoading.set(false),
      });
  }

  closeFollowers(): void {
    this.showFollowersDialog.set(false);
    this.followers.set([]);
  }

  openFollowing(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.showFollowingDialog.set(true);
    this.followingLoading.set(true);

    this.followService
      .getFollowing(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (users) => {
          this.following.set(users);
          this.followingLoading.set(false);
        },
        error: () => this.followingLoading.set(false),
      });
  }

  closeFollowing(): void {
    this.showFollowingDialog.set(false);
    this.following.set([]);
  }

  viewUserProfile(userId: number): void {
    this.router.navigate(['/profile', userId]);
    this.closeFollowers();
    this.closeFollowing();
  }

  /* ---------------- Media Helpers ---------------- */
  hasMedia(blog: Blog): boolean {
    return !!(blog.media && blog.media.trim());
  }

  getBlogMedia(blog: Blog): string[] {
    if (!blog.media) return [];
    try {
      const parsed = JSON.parse(blog.media);
      return Array.isArray(parsed)
        ? parsed.map((url: string) => `http://localhost:8080${url}`)
        : [];
    } catch {
      return [`http://localhost:8080${blog.media}`];
    }
  }

  isBlogVideo(blog: Blog): boolean {
    const mediaUrl = this.getBlogMedia(blog)[0];
    return !!mediaUrl && /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(mediaUrl);
  }

  /* ---------------- Navigation ---------------- */
  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  viewBlog(id: number): void {
    this.router.navigate(['/blogs', id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  /* ---------------- Report (Updated for MatDialog) ---------------- */
  openReportDialog(): void {
    if (this.hasAlreadyReported()) return;

    const userId = this.user()?.id;
    if (!userId) return;

    const dialogRef = this.dialog.open(ReportDialog, {
      width: '480px',
      maxWidth: '90vw',
      data: userId, // Pass userId (your dialog expects number)
      panelClass: 'report-dialog-panel',
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reason: string | undefined) => {
          if (reason) {
            this.submitReport(userId, reason);
          }
        },
      });
  }

  private submitReport(userId: number, reason: string): void {
    this.reportService
      .reportUser(userId, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // this.hasAlreadyReported.set(true);
        },
        error: (err) => console.error('Report failed', err),
      });
  }
}
