import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  ReportStatus, 
  ResolveReportRequest, 
  Report 
} from '../models/report.model';
import { BASE_URL } from './env';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${BASE_URL}/reports`;

  /**
   * Generic report function (matches backend DTO)
   */
  report(targetId: number, reason: string, type: 'USER' | 'BLOG'): Observable<Report> {
    const request = {
      targetId,      // ✅ Backend expects targetId
      type,          // ✅ Backend requires type
      reason         // ✅ Backend requires reason
    };
    
    console.log('📤 Sending report:', request); // ✅ Debug payload
    
    return this.http.post<ApiResponse<Report>>(`${this.apiUrl}`, request)
      .pipe(
        map(response => response.data),
        catchError(err => {
          console.error('Report error:', err);
          throw err;
        })
      );
  }

  /**
   * Report a user
   */
  reportUser(userId: number, reason: string): Observable<Report> {
    return this.report(userId, reason, 'USER');
  }

  /**
   * Report a blog
   */
  reportBlog(blogId: number, reason: string): Observable<Report> {
    return this.report(blogId, reason, 'BLOG');
  }

  /**
   * Check if current user has already reported a user
   */
  hasReportedUser(userId: number): Observable<boolean> {
    console.log('🔍 Service: Checking user report:', userId);
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check/user/${userId}`)
      .pipe(
        map(response => response.data),
        catchError(() => of(false))
      );
  }

  /**
   * Check if current user has already reported a blog
   */
  hasReportedBlog(blogId: number): Observable<boolean> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check/blog/${blogId}`)
      .pipe(
        map(response => response.data),
        catchError(() => of(false))
      );
  }

  // ... rest of methods unchanged (getAllReports, etc.)
  getAllReports(): Observable<Report[]> {
    return this.http.get<ApiResponse<Report[]>>(this.apiUrl).pipe(map(r => r.data));
  }

  getReportsByStatus(status: ReportStatus): Observable<Report[]> {
    return this.http.get<ApiResponse<Report[]>>(`${this.apiUrl}/status/${status}`).pipe(map(r => r.data));
  }

  getPendingReportsCount(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/pending/count`).pipe(map(r => r.data));
  }

  getReportById(reportId: number): Observable<Report> {
    return this.http.get<ApiResponse<Report>>(`${this.apiUrl}/${reportId}`).pipe(map(r => r.data));
  }

  resolveReport(reportId: number, request: ResolveReportRequest): Observable<Report> {
    return this.http.put<ApiResponse<Report>>(`${this.apiUrl}/${reportId}/resolve`, request).pipe(map(r => r.data));
  }

  dismissReport(reportId: number): Observable<Report> {
    return this.http.put<ApiResponse<Report>>(`${this.apiUrl}/${reportId}/dismiss`, {}).pipe(map(r => r.data));
  }

  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reportId}`);
  }

  getReportsForUser(userId: number): Observable<Report[]> {
    return this.http.get<ApiResponse<Report[]>>(`${this.apiUrl}/user/${userId}`).pipe(map(r => r.data));
  }
}
