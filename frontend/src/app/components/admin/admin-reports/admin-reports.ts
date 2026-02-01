import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { BASE_URL } from '../../../services/env';
import type { ApiResponse } from '../../../models/user.model';
import { FormsModule } from '@angular/forms';

// ✅ Material
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIcon } from '@angular/material/icon';

// ✅ Confirm Dialog
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog';
import { CommonModule } from '@angular/common';
import { ReasonDialogComponent } from '../../reason-dialog/reason-dialog';
import { Router } from '@angular/router';

export interface AdminReport {
  id: number;
  targetId: number;
  type: string;
  reason: string;
  status: string;
  reportedByUsername: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    FormsModule,
    MatIcon,
    CommonModule,
    // ✅ add dialog + snackbar
    MatDialogModule,
    MatSnackBarModule,

    // ✅ standalone confirm dialog
  ],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.scss',
})
export class AdminReports implements OnInit {
  private http = inject(HttpClient);

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  reports = signal<AdminReport[]>([]);
  totalPages = signal(0);
  currentPage = signal(0);
  totalElements = signal(0);
  currentFilter = signal<'all' | 'pending' | 'blog' | 'user'>('all');
  tempStatus = signal<'PENDING' | 'RESOLVED' | 'IGNORED'>('PENDING');

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
        const msg = err.error?.message ?? err.message ?? 'Failed to load reports.';
        this.errorMsg.set(msg);

        this.snackBar.open(msg, 'OK', { duration: 3000 });
      },
    });
  }
  openReasonDialog(reason: string): void {
    this.dialog.open(ReasonDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { reason },
    });
  }

  updateStatus(reportId: number, status: 'PENDING' | 'RESOLVED' | 'IGNORED'): void {
    this.http
      .put<ApiResponse<null>>(`${BASE_URL}/reports/${reportId}/status?status=${status}`, {})
      .subscribe({
        next: () => {
          this.snackBar.open('Status updated', 'OK', { duration: 1500 });
          this.loadReports(this.currentPage(), 20, this.currentFilter());
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message ?? err.message ?? 'Failed to update status.';
          this.errorMsg.set(msg);
          this.snackBar.open(msg, 'OK', { duration: 3000 });
        },
      });
  }

  // ✅ Dialog confirm instead of confirm()
  deleteReport(reportId: number): void {
    const report = this.reports().find((r) => r.id === reportId);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '340px',
      data: {
        message: `Delete this report${report ? ` (#${report.id}, ${report.type})` : ''}?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.http.delete<ApiResponse<null>>(`${BASE_URL}/reports/${reportId}`).subscribe({
        next: () => {
          // ✅ remove from UI instantly
          this.reports.update((list) => list.filter((r) => r.id !== reportId));
          this.totalElements.update((n) => Math.max(0, n - 1));

          this.snackBar.open('Report deleted', 'OK', { duration: 2000 });

          // optional reload to keep pagination correct
          this.loadReports(this.currentPage(), 20, this.currentFilter());
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message ?? err.message ?? 'Failed to delete report.';
          this.errorMsg.set(msg);
          this.snackBar.open(msg, 'OK', { duration: 3000 });
        },
      });
    });
  }
  goToTarget(r: AdminReport): void {
    const type = (r.type ?? '').toUpperCase();

    if (type == 'BLOG') {
      // ✅ adjust this path to your real blog detail route
      this.router.navigate(['/blogs', r.targetId]);
      return;
    }

    if (type == 'USER') {
      // ✅ adjust this path to your real user detail route
      this.router.navigate(['/profile', r.targetId]);
      return;
    }

    this.snackBar.open('Unknown report type: ' + r.type, 'OK', { duration: 2000 });
  }

  setFilter(filter: 'all' | 'pending' | 'blog' | 'user'): void {
    this.loadReports(0, 20, filter);
  }
}
