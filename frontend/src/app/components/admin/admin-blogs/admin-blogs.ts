import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BASE_URL } from '../../../services/env';
import type { ApiResponse } from '../../../models/user.model';
import { Router } from '@angular/router';

// ✅ dialog + snackbar
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// ✅ your confirm dialog component
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog';

export interface AdminBlog {
  id: number;
  title?: string;
  content?: string;
  createdAt?: string;
  visible?: boolean;
}

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  // ✅ add dialog/snackbar modules + confirm component
  imports: [MatDialogModule, MatSnackBarModule],
  templateUrl: './admin-blogs.html',
  styleUrl: './admin-blogs.scss',
})
export class AdminBlogs implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  blogs = signal<AdminBlog[]>([]);
  totalPages = signal(0);
  currentPage = signal(0);
  totalElements = signal(0);

  ngOnInit(): void {
    this.loadBlogs();
  }

  toggleVisible(blogId: number): void {
    this.http
      .patch<ApiResponse<boolean>>(`${BASE_URL}/admin/blogs/${blogId}/toggle-visible`, {})
      .subscribe({
        next: (res) => {
          const newVisible = res.data; // ✅ boolean

          this.blogs.update((blogs) =>
            blogs.map((blog) =>
              blog.id === blogId ? { ...blog, visible: newVisible } : blog,
            ),
          );

          this.snackBar.open(
            newVisible ? 'Blog is now visible' : 'Blog is now hidden',
            'OK',
            { duration: 2000 },
          );
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message ?? 'Failed to toggle visibility.';
          this.errorMsg.set(msg);
          this.snackBar.open(msg, 'OK', { duration: 3000 });
        },
      });
  }

  loadBlogs(page = 0, size = 20, search?: string) {
    this.loading.set(true);
    this.errorMsg.set(null);

    const params: Record<string, any> = { page, size };
    if (search && search.trim()) params['search'] = search.trim();

    this.http.get<ApiResponse<any>>(`${BASE_URL}/admin/blogs`, { params }).subscribe({
      next: (res) => {
        const data = res.data;

        const list: AdminBlog[] = (data?.blogs ?? data?.content ?? data) as AdminBlog[];
        this.blogs.set(Array.isArray(list) ? list : []);

        this.totalPages.set(data?.totalPages ?? 0);
        this.currentPage.set(data?.currentPage ?? 0);
        this.totalElements.set(data?.totalElements ?? 0);

        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err.error?.message ?? err.message ?? 'Failed to load blogs.';
        this.errorMsg.set(msg);
        this.snackBar.open(msg, 'OK', { duration: 3000 });
      },
    });
  }

  viewBlog(blogId: number) {
    this.router.navigate(['/blogs', blogId]);
  }

  // ✅ Dialog confirm instead of confirm()
  deleteBlog(blogId: number) {
    const blog = this.blogs().find((b) => b.id === blogId);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '340px',
      data: {
        message: `Delete this blog${blog?.title ? `: "${blog.title}"` : ''}?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.http.delete<ApiResponse<null>>(`${BASE_URL}/admin/blogs/${blogId}`).subscribe({
        next: () => {
          // ✅ remove from UI instantly
          this.blogs.update((list) => list.filter((b) => b.id !== blogId));
          this.totalElements.update((n) => Math.max(0, n - 1));

          this.snackBar.open('Blog deleted', 'OK', { duration: 2000 });

          // optional: reload to keep paging consistent
          this.loadBlogs(this.currentPage());
        },
        error: (err: HttpErrorResponse) => {
          const msg = err.error?.message ?? err.message ?? 'Failed to delete blog.';
          this.errorMsg.set(msg);
          this.snackBar.open(msg, 'OK', { duration: 3000 });
        },
      });
    });
  }
}
