import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../services/user.serivce';  // ✅ Fixed typo
import { BlogsService } from '../../services/blogs.service';
import { FollowService } from '../../services/follow.serivce';  // ✅ Fixed typo
import { ReportService } from '../../services/report.serivce';  // ✅ Fixed typo

import { User } from '../../models/user.model';
import { Blog } from '../../models/blog.model';
import { FollowResponse } from '../../models/follow.model';
import { 
  MatCardModule, 
} from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private userService = inject(UserService);
  private blogsService = inject(BlogsService);
  private followService = inject(FollowService);
  private reportService = inject(ReportService);

  /* ---------------- Signals (state) ---------------- */
  user = signal<User | null>(null);
  blogs = signal<Blog[]>([]);
  followStatus = signal<FollowResponse | null>(null);

  isOwnProfile = signal(false);
  isLoading = signal(true);
  hasAlreadyReported = signal(false);
  showReportDialog = signal(false);
  reportReason = signal('');

  /* ---------------- Computed values ---------------- */
  blogsCount = computed(() => this.blogs().length);
  hasNoBlogs = computed(() => !this.isLoading() && this.blogs().length === 0);

  isFollowing = computed(() => this.followStatus()?.following ?? false);
  followersCount = computed(() => this.followStatus()?.followerCount ?? 0);
  followingCount = computed(() => this.followStatus()?.followingCount ?? 0);

  /* ---------------- Lifecycle ---------------- */
ngOnInit(): void {
  // ✅ CORRECT: Subscribe + extract param
  this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
    const userId = Number(params.get('id'));  // ✅ params.get('id')
    console.log('Profile userId from URL:', userId);

    if (!userId) {
      this.router.navigate(['/']);
      return;
    }

    // Reset + reload for new user
    this.isLoading.set(true);
    this.user.set(null);
    this.blogs.set([]);

    this.loadProfile(userId);
    this.checkOwnership(userId);
    this.loadFollowStatus(userId);
    this.checkReportStatus(userId);
  });
}


  /* ---------------- Data loaders ---------------- */
  private loadProfile(userId: number): void {
    this.userService
      .getUserById(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          console.log('Loaded user:', user); // ✅ Debug
          this.user.set(user);
          this.loadBlogs(userId);
        },
        error: (err) => {
          console.error('Failed to load profile:', err);
          this.isLoading.set(false);
        }
      });
  }

  private loadBlogs(userId: number): void {
    this.blogsService
      .getBlogsByUserId(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blogs) => {
          console.log('Loaded blogs:', blogs); // ✅ Debug
          this.blogs.set(blogs);
          
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load blogs:', err);
          this.isLoading.set(false);
        }
      });
  }

  private checkOwnership(profileId: number): void {
    this.userService
      .getCurrentUserId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (currentId) => this.isOwnProfile.set(currentId === profileId),
        error: () => {} // Silent fail
      });
  }
  // Media helpers (reuse from BlogDetail logic)
hasMedia(blog: Blog): boolean {
  return !!(blog.media && blog.media.trim());
}

getBlogMedia(blog: Blog): string[] {
  if (!blog.media) return [];
  try {
    const parsed = JSON.parse(blog.media);
    return Array.isArray(parsed) ? parsed.map(url => `http://localhost:8080${url}`) : [];
  } catch {
    return [`http://localhost:8080${blog.media}`];
  }
}

isBlogVideo(blog: Blog): boolean {
  const mediaUrl = this.getBlogMedia(blog)[0];
  return mediaUrl ? /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(mediaUrl) : false;
}


  private loadFollowStatus(userId: number): void {
    this.followService
      .getFollowStatus(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (status) => {
          console.log('Follow status:', status); // ✅ Debug
          this.followStatus.set(status);
        },
        error: () => {} // Silent fail
      });
  }

  private checkReportStatus(userId: number): void {
    this.reportService
      .hasReportedUser(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reported) => this.hasAlreadyReported.set(reported));
  }

  /* ---------------- Actions ---------------- */
  toggleFollow(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.followService
      .toggleFollow(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (status) => {
          console.log('Follow toggled:', status);
          this.followStatus.set(status);
        },
        error: (err) => console.error('Follow toggle failed:', err)
      });
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  viewBlog(id: number): void {
    this.router.navigate(['/blogs', id]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  /* ---------------- Report dialog ---------------- */
  openReportDialog(): void {
    if (!this.hasAlreadyReported()) {
      this.showReportDialog.set(true);
    }
  }

  closeReportDialog(): void {
    this.showReportDialog.set(false);
    this.reportReason.set('');
  }

  submitReport(): void {
    const userId = this.user()?.id;
    const reason = this.reportReason().trim();
    if (!userId || !reason) return;

    this.reportService
      .reportUser(userId, reason)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          console.log('User reported');
          this.hasAlreadyReported.set(true);
          this.closeReportDialog();
        },
        error: (err) => console.error('Report failed:', err)
      });
  }
}
