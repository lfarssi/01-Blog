import { Component, OnInit, signal, computed, inject, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../services/user.serivce';
import { BlogsService } from '../../services/blogs.service';
import { FollowService } from '../../services/follow.serivce';
import { ReportService } from '../../services/report.serivce';
import { User } from '../../models/user.model';
import { Blog } from '../../models/blog.model';
import { FollowResponse } from '../../models/follow.model';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    FormsModule,
    MatTooltipModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private blogsService = inject(BlogsService);
  private followService = inject(FollowService);
  private reportService = inject(ReportService);

  // Signals for reactive state management
  user = signal<User | null>(null);
  blogs = signal<Blog[]>([]);
  followStatus = signal<FollowResponse | null>(null); // NEW: Single source of truth
  isOwnProfile = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  showReportDialog = signal<boolean>(false);
  reportReason = signal<string>('');
  hasAlreadyReported = signal<boolean>(false);
  
  // Computed values (Angular 21 magic)
  isFollowing = computed(() => this.followStatus()?.following ?? false);
  blogsCount = computed(() => this.blogs().length);
  hasNoBlogs = computed(() => this.blogs().length === 0 && !this.isLoading());
  followersCount = computed(() => this.followStatus()?.followerCount ?? 0);
  followingCount = computed(() => this.followStatus()?.followingCount ?? 0);

  constructor() {
    // Auto-sync user counts with followStatus changes
    effect(() => {
      const status = this.followStatus();
      const currentUser = this.user();
      if (status && currentUser) {
        this.user.set({
          ...currentUser,
          followersCount: status.followerCount,
          followingCount: status.followingCount
        });
      }
    });
  }

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (userId) {
      this.loadUserProfile(userId);
      this.checkIfOwnProfile(userId);
      this.loadFollowStatus(userId); // UPDATED
      this.checkReportStatus(userId);
      
      // Load current user following cache
      this.userService.getCurrentUserId().subscribe(currentId => {
        this.followService.loadFollowingIds(currentId);
      });
    }
  }

  private loadUserProfile(userId: number): void {
    this.isLoading.set(true);
    
    this.userService.getUserById(userId).subscribe({
      next: (userData) => {
        this.user.set(userData);
        this.loadUserBlogs(userId);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadUserBlogs(userId: number): void {
    this.blogsService.getBlogsByUserId(userId).subscribe({
      next: (blogsData: Blog[]) => {
        this.blogs.set(blogsData);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading blogs:', error);
        this.isLoading.set(false);
      }
    });
  }

  private checkIfOwnProfile(userId: number): void {
    this.userService.getCurrentUserId().subscribe({
      next: (currentUserId) => {
        this.isOwnProfile.set(currentUserId === userId);
      }
    });
  }

  /** UPDATED: Uses new getFollowStatus() endpoint */
  private loadFollowStatus(userId: number): void {
    this.followService.getFollowStatus(userId).subscribe({
      next: (status) => {
        this.followStatus.set(status);
      },
      error: (error) => console.error('Error loading follow status:', error)
    });
  }

  private checkReportStatus(userId: number): void {
    this.reportService.hasReportedUser(userId).subscribe({
      next: (reported) => {
        this.hasAlreadyReported.set(reported);
      }
    });
  }

  /** UPDATED: Single toggleFollow() - handles both follow/unfollow */
  toggleFollow(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    this.followService.toggleFollow(userId).subscribe({
      next: (response) => {
        this.followStatus.set(response); // Updates isFollowing + counts automatically
      },
      error: (error) => console.error('Toggle follow error:', error)
    });
  }

  editProfile(): void {
    this.router.navigate(['/profile/edit']);
  }

  viewBlog(blogId: number): void {
    this.router.navigate(['/blogs', blogId]);
  }

  openReportDialog(): void {
    if (!this.hasAlreadyReported()) {
      this.showReportDialog.set(true);
    }
  }

  closeReportDialog(): void {
    this.showReportDialog.set(false);
    this.reportReason.set('');
  }

  updateReportReason(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.reportReason.set(textarea.value);
  }

  submitReport(): void {
    const userId = this.user()?.id;
    const reason = this.reportReason();
    
    if (!userId || !reason.trim()) return;

    this.reportService.reportUser(userId, reason).subscribe({
      next: () => {
        this.hasAlreadyReported.set(true);
        this.closeReportDialog();
      },
      error: (error) => {
        console.error('Error submitting report:', error);
      }
    });
  }
}
