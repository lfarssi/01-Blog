import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Follower {
  id: number;
  userId: number;
  username: string;
  avatarUrl?: string;
  followedAt: Date;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/follows';

  // Signal to track current user's following list
  followingIds = signal<Set<number>>(new Set());

  /**
   * Follow a user
   */
  follow(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}`, {}).pipe(
      tap(() => {
        const currentFollowing = this.followingIds();
        const updated = new Set(currentFollowing);
        updated.add(userId);
        this.followingIds.set(updated);
      })
    );
  }

  /**
   * Unfollow a user
   */
  unfollow(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`).pipe(
      tap(() => {
        const currentFollowing = this.followingIds();
        const updated = new Set(currentFollowing);
        updated.delete(userId);
        this.followingIds.set(updated);
      })
    );
  }

  /**
   * Check if current user is following a specific user
   */
  isFollowing(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/status/${userId}`);
  }

  /**
   * Get list of followers for a user
   */
  getFollowers(userId: number): Observable<Follower[]> {
    return this.http.get<Follower[]>(`${this.apiUrl}/${userId}/followers`);
  }

  /**
   * Get list of users that a user is following
   */
  getFollowing(userId: number): Observable<Follower[]> {
    return this.http.get<Follower[]>(`${this.apiUrl}/${userId}/following`);
  }

  /**
   * Get follow statistics for a user
   */
  getFollowStats(userId: number): Observable<FollowStats> {
    return this.http.get<FollowStats>(`${this.apiUrl}/${userId}/stats`);
  }

  /**
   * Load current user's following list into signal
   */
  loadFollowingIds(currentUserId: number): void {
    this.getFollowing(currentUserId).subscribe({
      next: (following) => {
        const ids = new Set(following.map(f => f.userId));
        this.followingIds.set(ids);
      }
    });
  }

  /**
   * Check if user is in following list (from signal cache)
   */
  isFollowingCached(userId: number): boolean {
    return this.followingIds().has(userId);
  }
}
