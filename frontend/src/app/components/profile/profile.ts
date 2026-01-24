import { Component, OnInit, signal, computed, inject, DestroyRef,ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

// ✅ FIXED service imports - corrected typos
import { UserService } from '../../services/user.serivce';
import { BlogsService } from '../../services/blogs.service';
import { FollowService } from '../../services/follow.serivce';
import { ReportService } from '../../services/report.serivce';

// ✅ Infinite scroll directive
import { InfiniteListDirective } from '../../directives/infinite-list';

import { User } from '../../models/user.model';
import { Blog } from '../../models/blog.model';
import { FollowResponse } from '../../models/follow.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"; // ✅ FIXED import

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    MatTooltipModule,
    InfiniteListDirective,
    MatProgressSpinnerModule // ✅ FIXED
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush // ✅ Added for signals perf [web:20]
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private currentUserId = signal(-1); // ✅ Made reactive

  private userService = inject(UserService);
  private blogsService = inject(BlogsService);
  private followService = inject(FollowService);
  private reportService = inject(ReportService);

  /* ---------------- Signals ---------------- */
  user = signal<User | null>(null);
  blogs = signal<Blog[]>([]);
  followStatus = signal<FollowResponse | null>(null);

  /* ✅ INFINITE SCROLL */
  blogsPage = signal(0);
  blogsLoadingMore = signal(false);
  hasMoreBlogs = signal(true);

  isOwnProfile = signal(false);
  isLoading = signal(true);
  hasAlreadyReported = signal(false);
  showReportDialog = signal(false);
  reportReason = signal('');

  /* ---------------- Computed ---------------- */
  blogsCount = computed(() => this.blogs().length);
  hasNoBlogs = computed(
    () => !this.isLoading() && this.blogs().length === 0 && !this.blogsLoadingMore()
  );
  isFollowing = computed(() => this.followStatus()?.following ?? false);
  followersCount = computed(() => this.followStatus()?.followerCount ?? 0);
  followingCount = computed(() => this.followStatus()?.followingCount ?? 0);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const userId = Number(params.get('id'));
      console.log('Profile userId:', userId);

      if (!userId) {
        this.router.navigate(['/']);
        return;
      }

      // Reset for new profile
      this.resetProfileState();
      this.loadProfile(userId);
    });
  }

  private async resetProfileState(): Promise<void> { // ✅ Made async
    this.isLoading.set(true);
    this.user.set(null);
    this.blogs.set([]);
    this.blogsPage.set(0);
    this.hasMoreBlogs.set(true);
  }

  private async loadProfile(userId: number): Promise<void> { // ✅ Made async
    try {
      const user = await firstValueFrom(this.userService.getUserById(userId)); // ✅ Fixed toPromise deprecation [web:25][web:27]
      this.user.set(user);
      
      const currentId = await firstValueFrom(this.userService.getCurrentUserId()); // ✅ Fixed
      this.currentUserId.set(currentId);
      this.isOwnProfile.set(user.id === currentId);

      // ✅ Parallel loading with signals
      this.loadFollowStatus(userId);
      this.checkReportStatus(userId);
      this.loadMoreBlogs(); // ✅ First page
      this.isLoading.set(false);
    } catch (err) {
      console.error('Failed to load profile:', err);
      this.isLoading.set(false);
    }
  }

  /** ✅ INFINITE SCROLL - Load more blogs */
  loadMoreBlogs(): void {
    if (this.blogsLoadingMore() || !this.hasMoreBlogs() || !this.user()) return;

    this.blogsLoadingMore.set(true);
    const nextPage = this.blogsPage() ;

    this.blogsService
      .getBlogsByUser(this.user()!.id, nextPage, 10)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          
          const newBlogs = response.data || response; // ✅ Extract array
          // console.log('New blogs:', newBlogs);
          
          this.blogs.update(prev => [...prev, ...newBlogs]);
          this.blogsPage.set(nextPage);
          this.hasMoreBlogs.set(newBlogs.length === 10);
          this.blogsLoadingMore.set(false);
        },
        error: (err) => {
          console.error('Failed to load more blogs:', err);
          this.blogsLoadingMore.set(false);
        }
      });
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

  /* Media helpers (keep for template) */
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
    return mediaUrl ? /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(mediaUrl) : false;
  }

  /* Actions */
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

  openReportDialog(): void {
    if (!this.hasAlreadyReported()) this.showReportDialog.set(true);
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
          this.hasAlreadyReported.set(true);
          this.closeReportDialog();
        },
      });
  }
}
