import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Follower, FollowStats } from '../models/follow.model';
import { FollowResponse } from '../models/follow.model'; 
import { BASE_URL } from './env';

@Injectable({
  providedIn: 'root'
})
export class FollowService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE_URL}/follow`;

  // Signal to track current user's following list
  followingIds = signal<Set<number>>(new Set());

  /**
   * Toggle follow/unfollow a user (matches backend POST /{userId})
   */
  toggleFollow(userId: number): Observable<FollowResponse> {
    return this.http.post<FollowResponse>(`${this.apiUrl}/${userId}`, {}).pipe(
      tap(response => {
        const currentFollowing = this.followingIds();
        const updated = new Set(currentFollowing);
        
        if (response.following) {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        
        this.followingIds.set(updated);
      })
    );
  }

  /**
   * Get follow status + counts (matches backend GET /{userId}/status)
   */
  getFollowStatus(userId: number): Observable<FollowResponse> {
    return this.http.get<FollowResponse>(`${this.apiUrl}/${userId}/status`);
  }

  /**
   * Get list of followers (matches backend)
   */
  getFollowers(userId: number): Observable<Follower[]> {
    return this.http.get<Follower[]>(`${this.apiUrl}/${userId}/followers`);
  }

  /**
   * Get list of users a user follows (matches backend)
   */
  getFollowing(userId: number): Observable<Follower[]> {
    return this.http.get<Follower[]>(`${this.apiUrl}/${userId}/following`);
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
   * Check cached following status (signals!)
   */
  isFollowingCached(userId: number): boolean {
    return this.followingIds().has(userId);
  }
}
