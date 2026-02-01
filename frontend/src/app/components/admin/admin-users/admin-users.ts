import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BASE_URL } from '../../../services/env';
import type { ApiResponse, PageResponse, User } from '../../../models/user.model';

// ✅ Material
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// ✅ Confirm Dialog (standalone)
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatDialogModule, MatSnackBarModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.scss',
})
export class AdminUsers implements OnInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  users = signal<User[]>([]);
  totalPages = signal(0);
  currentPage = signal(0);
  totalElements = signal(0);

  ngOnInit(): void {
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
        const msg =
          err.status === 403
            ? '403 Forbidden: ADMIN only.'
            : (err.error?.message ?? err.message ?? 'Failed to load users.');
        this.errorMsg.set(msg);
        this.snackBar.open(msg, 'OK', { duration: 3000 });
      },
    });
  }

  toggleBan(u: User) {
    const isBanned = !!u.banned;
    const action = isBanned ? 'Unban' : 'Ban';

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '340px',
      data: {
        message: `${action} user "${u.username}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      const endpointAction = isBanned ? 'unban' : 'ban';

      this.http
        .post<ApiResponse<null>>(`${BASE_URL}/admin/users/${u.id}/${endpointAction}`, {})
        .subscribe({
          next: () => {
            // ✅ update UI immediately (no need to reload)
            this.users.update((list) =>
              list.map((x) => (x.id === u.id ? { ...x, banned: !isBanned } : x)),
            );

            this.snackBar.open(isBanned ? 'User unbanned' : 'User banned', 'OK', {
              duration: 2000,
            });

            // Optional: keep backend pagination in sync if you need it
            // this.loadUsers(this.currentPage());
          },
          error: (err: HttpErrorResponse) => {
            const msg = err.error?.message ?? err.message ?? 'Failed to update user.';
            this.errorMsg.set(msg);
            this.snackBar.open(msg, 'OK', { duration: 3000 });
          },
        });
    });
  }

  // ✅ Dialog confirm instead of confirm()
  deleteUser(u: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '340px',
      data: {
        message: `Delete user "${u.username}"? This cannot be undone.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.http.delete<ApiResponse<null>>(`${BASE_URL}/admin/users/${u.id}`).subscribe({
        next: () => {
          // remove from UI immediately (optional but feels great)
          this.users.update((list) => list.filter((x) => x.id !== u.id));
          this.totalElements.update((n) => Math.max(0, n - 1));

          this.snackBar.open('User deleted', 'OK', { duration: 2000 });

          // reload to keep pagination consistent
          this.loadUsers(this.currentPage());
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message ?? err.message ?? 'Failed to delete user.';
          this.errorMsg.set(msg);
          this.snackBar.open(msg, 'OK', { duration: 3000 });
        },
      });
    });
  }
}
