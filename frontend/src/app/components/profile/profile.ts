import { Component, OnInit, signal, computed, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../services/user.serivce';
import { BlogsService } from '../../services/blogs.service';
import { FollowService } from '../../services/follow.serivce';
import { ReportService } from '../../services/report.serivce';

import { User } from '../../models/user.model';
import { Blog } from '../../models/blog.model';
import { FollowResponse } from '../../models/follow.model';
import { MatCard, MatCardContent, MatCardTitle, MatCardActions, MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatChip, MatChipSet, MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatIcon,
    MatChip,
    MatChipSet,
    MatCardContent,
    MatCardTitle,
    MatCardActions,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule
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
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    if (!userId) {
      this.router.navigate(['/']);
      return;
    }

    this.loadProfile(userId);
    this.checkOwnership(userId);
    this.loadFollowStatus(userId);
    this.checkReportStatus(userId);
  }

  /* ---------------- Data loaders ---------------- */

  private loadProfile(userId: number): void {
    this.userService
      .getUserById(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.user.set(user);
          console.log(this.user());
          
          this.loadBlogs(userId);
        },
        error: () => this.isLoading.set(false),
      });
  }

  private loadBlogs(userId: number): void {
    this.blogsService
      .getBlogsByUserId(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blogs) => {
          this.blogs.set(blogs);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  private checkOwnership(profileId: number): void {
    this.userService
      .getCurrentUserId()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.isOwnProfile.set(id === profileId));
  }

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
      .subscribe((reported) => this.hasAlreadyReported.set(reported));
  }

  /* ---------------- Actions ---------------- */

  toggleFollow(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.followService
      .toggleFollow(userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((status) => this.followStatus.set(status));
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
      .subscribe(() => {
        this.hasAlreadyReported.set(true);
        this.closeReportDialog();
      });
  }
}
