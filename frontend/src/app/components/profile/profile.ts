import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../services/user.serivce';
import { BlogsService } from '../../services/blogs.service';
import { FollowService } from '../../services/follows.serivce';
import { ReportService } from '../../services/report.serivce';

interface User {
  id: number;
  username: string; 
  email: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Date;
  followersCount: number;
  followingCount: number;
}

interface Blog {
  id: number;
  description: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video';
  timestamp: Date;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule
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
  isFollowing = signal<boolean>(false);
  isOwnProfile = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  showReportDialog = signal<boolean>(false);
  reportReason = signal<string>('');
  hasAlreadyReported = signal<boolean>(false);
  
  // Computed values
  blogsCount = computed(() => this.blogs().length);
  hasNoBlogs = computed(() => this.blogs().length === 0 && !this.isLoading());

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    
    if (userId) {
      this.loadUserProfile(+userId);
      this.checkIfOwnProfile(+userId);
      this.checkFollowStatus(+userId);
      this.checkReportStatus(+userId);
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
    next: (blogsData:any) => {
      this.blogs.set(blogsData);
      this.isLoading.set(false);
    },
    error: (error: any) => {
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

  private checkFollowStatus(userId: number): void {
    this.followService.isFollowing(userId).subscribe({
      next: (following) => {
        this.isFollowing.set(following);
      }
    });
  }

  private checkReportStatus(userId: number): void {
    this.reportService.hasReportedUser(userId).subscribe({
      next: (reported) => {
        this.hasAlreadyReported.set(reported);
      }
    });
  }

  toggleFollow(): void {
    const userId = this.user()?.id;
    if (!userId) return;

    if (this.isFollowing()) {
      this.followService.unfollow(userId).subscribe({
        next: () => {
          this.isFollowing.set(false);
          this.updateFollowerCount(-1);
        }
      });
    } else {
      this.followService.follow(userId).subscribe({
        next: () => {
          this.isFollowing.set(true);
          this.updateFollowerCount(1);
        }
      });
    }
  }

  private updateFollowerCount(change: number): void {
    const currentUser = this.user();
    if (currentUser) {
      this.user.set({
        ...currentUser,
        followersCount: currentUser.followersCount + change
      });
    }
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
