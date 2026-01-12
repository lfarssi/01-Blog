// src/app/blogs/blogs.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Blog } from '../../models/blogs';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './blogs.html',
  styleUrls: ['./blogs.scss']
})
export class Blogs {
  blogs: Blog[] = [];
  loading = false;
  errorMsg: string | null = null;

  constructor(private http: HttpClient) {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.loading = true;
    this.errorMsg = null;

    this.http
      .get<ApiResponse<Blog[]>>('http://localhost:8080/api/blogs')
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.blogs = res.data || [];
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Failed to load blogs';
        }
      });
  }
}
