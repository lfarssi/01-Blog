import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BASE_URL } from '../../../services/env';
import type { ApiResponse, PageResponse, User } from '../../../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  private http = inject(HttpClient);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  users = signal<User[]>([]);
  totalPages = signal(0);
  currentPage = signal(0);
  totalElements = signal(0);

  ngOnInit(): void {
    console.log('[Admin] init');
    this.loadUsers();
  }

  loadUsers(page = 0, size = 20, search?: string) {
    this.loading.set(true);
    this.errorMsg.set(null);

    const params: Record<string, any> = { page, size };
    if (search && search.trim()) params['search'] = search.trim();

    this.http.get<ApiResponse<PageResponse>>(`${BASE_URL}/admin/users`, { params }).subscribe({
      next: (res) => {
        const data = res.data;
        this.users.set(data.users ?? []);
        this.totalPages.set(data.totalPages ?? 0);
        this.currentPage.set(data.currentPage ?? 0);
        this.totalElements.set(data.totalElements ?? 0);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        if (err.status === 403) this.errorMsg.set('403 Forbidden: ADMIN only.');
        else this.errorMsg.set(err.error?.message ?? err.message ?? 'Failed to load users.');
      },
    });
  }

  toggleBan(u: User) {
    const action = u.banned ? 'unban' : 'ban';

    this.http.post<ApiResponse<null>>(`${BASE_URL}/admin/users/${u.id}/${action}`, {}).subscribe({
      next: () => this.loadUsers(this.currentPage()),
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message ?? err.message ?? 'Failed to update user.');
      },
    });
  }

  deleteUser(u: User) {
    if (!confirm(`Delete user "${u.username}"?`)) return;

    this.http.delete<ApiResponse<null>>(`${BASE_URL}/admin/users/${u.id}`).subscribe({
      next: () => this.loadUsers(this.currentPage()),
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message ?? err.message ?? 'Failed to delete user.');
      },
    });
  }
}
