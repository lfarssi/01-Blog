import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  ReportStatus,
  ResolveReportRequest,
  Report,
} from '../models/report.model';
import { BASE_URL } from './env';

import { MatSnackBar } from '@angular/material/snack-bar'; // ✅ add

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar); // ✅ add
  private apiUrl = `${BASE_URL}/reports`;

  /* ---------------- Generic report ---------------- */

  report(
    targetId: number,
    reason: string,
    type: 'USER' | 'BLOG',
  ): Observable<Report> {
    const request = { targetId, type, reason };

    return this.http.post<ApiResponse<Report>>(`${this.apiUrl}`, request).pipe(
      map((response) => response.data),
      catchError((err) => {
        let message = 'Report failed. Please try again.';

        if (err?.status === 401) {
          message = 'Session expired. Please login again.';
        } else if (err?.status === 403) {
          message = 'You are not allowed to report.';
        } else if (err?.error?.message) {
          message = err.error.message;
        }

        this.showError(message);
        return throwError(() => err);
      }),
    );
  }

  /* ---------------- Report shortcuts ---------------- */

  reportUser(userId: number, reason: string): Observable<Report> {
    return this.report(userId, reason, 'USER');
  }

  reportBlog(blogId: number, reason: string): Observable<Report> {
    return this.report(blogId, reason, 'BLOG');
  }

  /* ---------------- Check already reported ---------------- */

  hasReportedUser(userId: number): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(`${this.apiUrl}/check/user/${userId}`)
      .pipe(
        map((response) => response.data),
        catchError(() => of(false)), // ✅ silent fallback is OK here
      );
  }

  hasReportedBlog(blogId: number): Observable<boolean> {
    return this.http
      .get<ApiResponse<boolean>>(`${this.apiUrl}/check/blog/${blogId}`)
      .pipe(
        map((response) => response.data),
        catchError(() => of(false)), // ✅ silent fallback is OK here
      );
  }

  /* ---------------- Admin / Listing ---------------- */

  getAllReports(): Observable<Report[]> {
    return this.http.get<ApiResponse<Report[]>>(this.apiUrl).pipe(
      map((r) => r.data),
      catchError((err) => {
        this.showError('Failed to load reports.');
        return throwError(() => err);
      }),
    );
  }

  getReportsByStatus(status: ReportStatus): Observable<Report[]> {
    return this.http
      .get<ApiResponse<Report[]>>(`${this.apiUrl}/status/${status}`)
      .pipe(
        map((r) => r.data),
        catchError((err) => {
          this.showError('Failed to load reports by status.');
          return throwError(() => err);
        }),
      );
  }

  getPendingReportsCount(): Observable<number> {
    return this.http
      .get<ApiResponse<number>>(`${this.apiUrl}/pending/count`)
      .pipe(
        map((r) => r.data),
        catchError((err) => {
          this.showError('Failed to load pending reports count.');
          return throwError(() => err);
        }),
      );
  }

  getReportById(reportId: number): Observable<Report> {
    return this.http.get<ApiResponse<Report>>(`${this.apiUrl}/${reportId}`).pipe(
      map((r) => r.data),
      catchError((err) => {
        this.showError('Failed to load report details.');
        return throwError(() => err);
      }),
    );
  }

  resolveReport(reportId: number, request: ResolveReportRequest): Observable<Report> {
    return this.http
      .put<ApiResponse<Report>>(`${this.apiUrl}/${reportId}/resolve`, request)
      .pipe(
        map((r) => r.data),
        catchError((err) => {
          this.showError('Failed to resolve report.');
          return throwError(() => err);
        }),
      );
  }

  dismissReport(reportId: number): Observable<Report> {
    return this.http
      .put<ApiResponse<Report>>(`${this.apiUrl}/${reportId}/dismiss`, {})
      .pipe(
        map((r) => r.data),
        catchError((err) => {
          this.showError('Failed to dismiss report.');
          return throwError(() => err);
        }),
      );
  }

  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}`).pipe(
      catchError((err) => {
        this.showError('Failed to delete report.');
        return throwError(() => err);
      }),
    );
  }

  getReportsForUser(userId: number): Observable<Report[]> {
    return this.http
      .get<ApiResponse<Report[]>>(`${this.apiUrl}/user/${userId}`)
      .pipe(
        map((r) => r.data),
        catchError((err) => {
          this.showError('Failed to load user reports.');
          return throwError(() => err);
        }),
      );
  }

  /* ---------------- UI helper ---------------- */

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
