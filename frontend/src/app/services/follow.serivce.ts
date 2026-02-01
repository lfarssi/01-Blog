import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

import { FollowResponse } from '../models/follow.model';
import { BASE_URL } from './env';
import { User } from '../models/user.model';

import { MatSnackBar } from '@angular/material/snack-bar'; // ✅ add

@Injectable({
  providedIn: 'root',
})
export class FollowService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar); // ✅ add

  private apiUrl = `${BASE_URL}/follow`;

  followingIds = signal<Set<number>>(new Set());

  /* ---------------- Follow / Unfollow ---------------- */

  toggleFollow(userId: number): Observable<FollowResponse> {
    return this.http.post<any>(`${this.apiUrl}/${userId}`, {}).pipe(
      map((apiResponse: any) => apiResponse.data),
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

  /* ---------------- Status ---------------- */

  getFollowStatus(userId: number): Observable<FollowResponse> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/status`).pipe(
      map((apiResponse: any) => apiResponse.data),
    );
  }

  /* ---------------- Lists ---------------- */

  getFollowers(userId: number): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/followers`).pipe(
      map((apiResponse: any) => apiResponse.data || []),
    );
  }

  getFollowing(userId: number): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/following`).pipe(
      map((apiResponse: any) => apiResponse.data || []),
    );
  }

  /* ---------------- Cache ---------------- */

  loadFollowingIds(currentUserId: number): void {
    if (!currentUserId || currentUserId <= 0) {
      this.showError('Invalid user session. Please login again.');
      return;
    }

    this.getFollowing(currentUserId).subscribe({
      next: (following: User[]) => {
        const ids = new Set(
          following
            .map((f) => f.id)
            .filter((id): id is number => id > 0),
        );

        this.followingIds.set(ids);
      },
      error: () => {
        this.showError('Failed to load following list.');
      },
    });
  }

  isFollowingCached(userId: number): boolean {
    return this.followingIds().has(userId);
  }

  /* ---------------- UI Helper ---------------- */

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
