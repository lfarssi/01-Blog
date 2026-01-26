import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BASE_URL } from '../../../services/env';
import type { ApiResponse } from '../../../models/user.model';
import { Router } from '@angular/router';

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
  imports: [],
  templateUrl: './admin-blogs.html',
  styleUrl: './admin-blogs.scss',
})
export class AdminBlogs implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

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
    this.http.patch<{ visible: boolean }>(`${BASE_URL}/admin/blogs/${blogId}/toggle-visible`, {})
      .subscribe({
        next: (res) => {
          // Update local blog state immediately (optimistic update)
          this.blogs.update(blogs => 
            blogs.map(blog => 
              blog.id === blogId 
                ? { ...blog, visible: res.visible } 
                : blog
            )
          );
        },
        error: (err: HttpErrorResponse) => {
          this.errorMsg.set(err.error?.message ?? 'Failed to toggle visibility.');
        }
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
        this.errorMsg.set(err.error?.message ?? err.message ?? 'Failed to load blogs.');
      },
    });
  }

  // ✅ Hide functionality REMOVED
  viewBlog(blogId: number) {
    // Navigate to blog or open modal
    this.router.navigate(['/blogs', blogId]);
  }

  deleteBlog(blogId: number) {
    if (!confirm('Delete this blog?')) return;

    this.http.delete<ApiResponse<null>>(`${BASE_URL}/admin/blogs/${blogId}`).subscribe({
      next: () => this.loadBlogs(this.currentPage()),
      error: (err: HttpErrorResponse) => {
        this.errorMsg.set(err.error?.message ?? err.message ?? 'Failed to delete blog.');
      },
    });
  }
}
