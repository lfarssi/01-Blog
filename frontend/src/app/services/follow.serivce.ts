import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';  // ← ADD map
import { Follower, FollowStats } from '../models/follow.model';
import { FollowResponse } from '../models/follow.model';
import { BASE_URL } from './env';

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE_URL}/follow`;

  followingIds = signal<Set<number>>(new Set());

  toggleFollow(userId: number): Observable<FollowResponse> {
    return this.http.post<any>(`${this.apiUrl}/${userId}`, {}).pipe(  // ← any for ApiResponse
      map((apiResponse: any) => apiResponse.data),  // ← Extract data
      tap((response: FollowResponse) => {
        const currentFollowing = this.followingIds();
        const updated = new Set(currentFollowing);

        if (response.following) {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }

        this.followingIds.set(updated);
      }),
    );
  }

  getFollowStatus(userId: number): Observable<FollowResponse> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/status`).pipe(
      map((apiResponse: any) => apiResponse.data)  // ← Extract data
    );
  }

  getFollowers(userId: number): Observable<Follower[]> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/followers`).pipe(
      map((apiResponse: any) => apiResponse.data || [])  // ✅ Safe array!
    );
  }

  getFollowing(userId: number): Observable<Follower[]> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/following`).pipe(
      map((apiResponse: any) => {
        console.log('Raw following response:', apiResponse);  // ← DEBUG
        return apiResponse.data || [];  // ✅ Safe array!
      })
    );
  }

  loadFollowingIds(currentUserId: number): void {
    if (!currentUserId || currentUserId <= 0) {
      console.warn('Invalid currentUserId:', currentUserId);
      return;
    }

    this.getFollowing(currentUserId).subscribe({
      next: (following: Follower[]) => {
        console.log('Following loaded:', following);
        const ids = new Set(following.map((f) => f.userId).filter((id): id is number => id > 0));
        this.followingIds.set(ids);
      },
      error: (error) => {
        console.error('Follow load error:', error);
      },
    });
  }

  isFollowingCached(userId: number): boolean {
    return this.followingIds().has(userId);
  }
}
