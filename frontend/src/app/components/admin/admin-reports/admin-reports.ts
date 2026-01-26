import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BASE_URL } from '../../../services/env';
import type { ApiResponse } from '../../../models/user.model';
import { FormsModule } from '@angular/forms';
import { MatIcon } from "@angular/material/icon";

export interface AdminReport {
  id: number;
  targetId: number;
  type: string;
  reason: string;
  status: string;
  reportedBy: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.scss',
})
export class AdminReports implements OnInit {
  private http = inject(HttpClient);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  reports = signal<AdminReport[]>([]);
  totalPages = signal(0);
  currentPage = signal(0);
  totalElements = signal(0);
  currentFilter = signal<'all' | 'pending' | 'blog' | 'user'>('all');
  tempStatus = signal<'PENDING' | 'RESOLVED' | 'IGNORED'>('PENDING'); // ADD THIS

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(page = 0, size = 20, filter: 'all' | 'pending' | 'blog' | 'user' = 'all') {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.currentFilter.set(filter);

    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    const url =
      filter === 'all'
        ? `${BASE_URL}/reports`
        : filter === 'pending'
          ? `${BASE_URL}/reports/status/PENDING`
          : `${BASE_URL}/reports/type/${filter.toUpperCase()}`;

    this.http.get<ApiResponse<any>>(url, { params }).subscribe({
      next: (res) => {
        const data = res.data;
        const list: AdminReport[] = (data?.reports ?? data?.content ?? data) as AdminReport[];
        this.reports.set(Array.isArray(list) ? list : []);

        this.totalPages.set(data?.totalPages ?? 0);
        this.currentPage.set(data?.currentPage ?? 0);
        this.totalElements.set(data?.totalElements ?? 0);

        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message ?? err.message ?? 'Failed to load reports.');
      },
    });
  }

  updateStatus(reportId: number, status: 'PENDING' | 'RESOLVED' | 'IGNORED'): void {
    this.http
      .put<ApiResponse<null>>(`${BASE_URL}/reports/${reportId}/status?status=${status}`, {})
      .subscribe({
        next: () => this.loadReports(this.currentPage(), 20, this.currentFilter()),
        error: (err: HttpErrorResponse) => {
          this.errorMsg.set(err.error?.message ?? err.message ?? 'Failed to update status.');
        },
      });
  }

  deleteReport(reportId: number): void {
    if (!confirm('Delete this report?')) return;

    this.http.delete<ApiResponse<null>>(`${BASE_URL}/reports/${reportId}`).subscribe({
      next: () => this.loadReports(this.currentPage(), 20, this.currentFilter()),
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message ?? err.message ?? 'Failed to delete report.');
      },
    });
  }

  // Filter shortcuts
  setFilter(filter: 'all' | 'pending' | 'blog' | 'user'): void {
    this.loadReports(0, 20, filter);
  }
}
