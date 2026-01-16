import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateBlogReportRequest, CreateUserReportRequest, ReportStatus, ResolveReportRequest } from '../models/report.model';
import { BASE_URL } from './env';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE_URL}/reports`;

  /**
   * Report a user for inappropriate behavior
   */
  reportUser(userId: number, reason: string): Observable<Report> {
    const request: CreateUserReportRequest = {
      reportedUserId: userId,
      reason
    };
    return this.http.post<Report>(`${this.apiUrl}/user`, request);
  }

  /**
   * Report a blog post for inappropriate content
   */
  reportBlog(blogId: number, reason: string): Observable<Report> {
    const request: CreateBlogReportRequest = {
      reportedBlogId: blogId,
      reason
    };
    return this.http.post<Report>(`${this.apiUrl}/blog`, request);
  }

  /**
   * Get all reports (Admin only)
   */
  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }

  /**
   * Get reports by status (Admin only)
   */
  getReportsByStatus(status: ReportStatus): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/status/${status}`);
  }

  /**
   * Get pending reports count (Admin only)
   */
  getPendingReportsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/pending/count`);
  }

  /**
   * Get a specific report by ID (Admin only)
   */
  getReportById(reportId: number): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${reportId}`);
  }

  /**
   * Resolve a report with an action (Admin only)
   */
  resolveReport(reportId: number, request: ResolveReportRequest): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${reportId}/resolve`, request);
  }

  /**
   * Dismiss a report (Admin only)
   */
  dismissReport(reportId: number): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${reportId}/dismiss`, {});
  }

  /**
   * Delete a report (Admin only)
   */
  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}`);
  }

  /**
   * Get reports for a specific user (Admin only)
   */
  getReportsForUser(userId: number): Observable<Report[]> {
    return this.http.get<Report[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Check if current user has already reported a user
   */
  hasReportedUser(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/user/${userId}`);
  }

  /**
   * Check if current user has already reported a blog
   */
  hasReportedBlog(blogId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check/blog/${blogId}`);
  }
}
