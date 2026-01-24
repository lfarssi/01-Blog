import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

import { BlogsService } from '../../services/blogs.service';
import { Blog } from '../../models/blog.model';
import { InfiniteListDirective } from '../../directives/infinite-list'; // <-- adjust path

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [MatCardModule, CommonModule, InfiniteListDirective],
  templateUrl: './blogs.html',
  styleUrls: ['./blogs.scss'],
})
export class Blogs implements OnInit {
  blogs = signal<Blog[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  errorMsg = signal<string | null>(null);

  // paging
  private page = signal(0);
  private readonly size = 10;
  private hasMore = signal(true);

  private blogServices = inject(BlogsService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadFirstPage();
  }

  private loadFirstPage(): void {
    this.blogs.set([]);
    this.page.set(0);
    this.hasMore.set(true);
    this.errorMsg.set(null);

    this.loading.set(true);
    this.fetchPage(0, true);
  }

  // called by sentinel (infiniteList)
  loadMoreBlogs(): void {
    if (this.loading() || this.loadingMore() || !this.hasMore()) return;

    this.loadingMore.set(true);
    this.fetchPage(this.page() + 1, false);
  }

  private fetchPage(page: number, isFirst: boolean): void {
    // ✅ you need a paged endpoint in service
    this.blogServices.getFollowingBlogs(page, this.size).subscribe({
      next: (res: any) => {
        const items: Blog[] = res.data ?? res ?? [];

        if (isFirst) {
          this.blogs.set(items);
          this.loading.set(false);
        } else {
          this.blogs.update((prev) => [...prev, ...items]);
          this.loadingMore.set(false);
        }

        // update paging flags
        this.page.set(page);
        if (items.length < this.size) this.hasMore.set(false);
      },
      error: (err) => {
        console.log(err);

        if (isFirst) {
          this.errorMsg.set('Failed to load blogs');
          this.loading.set(false);
        } else {
          this.errorMsg.set('Failed to load more blogs');
          this.loadingMore.set(false);
        }
      },
    });
  }

  viewBlogDetail(blogId: number): void {
    this.router.navigate(['/blogs', blogId]);
  }
}
