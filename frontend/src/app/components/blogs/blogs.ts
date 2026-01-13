import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { BlogsService } from '../../services/blogs.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './blogs.html',
  styleUrls: ['./blogs.scss'],
})
export class Blogs implements OnInit {
  blogs = signal<Blog[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);

  private blogServices = inject(BlogsService);
  private router = inject(Router);

  ngOnInit(): void {
    this.blogServices.getBlogs().subscribe({
      next: (res) => {
        console.log(res);
        
        this.blogs.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMsg.set('Failed to load blogs');
        this.loading.set(false);
      },
    });
  }

  viewBlogDetail(blogId: number): void {
    this.router.navigate(['/blogs', blogId]);
  }
}
