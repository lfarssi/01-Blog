import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Import Router
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blogs',
  standalone: true,
  imports: [MatCardModule, CommonModule],
  templateUrl: './blogs.html',
  styleUrls: ['./blogs.scss']
})
export class Blogs implements OnInit {
  blogs: any[] = [];
  loading = true;
  errorMsg: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:8080/api/blogs')
      .subscribe({
        next: (res) => {
          console.log(res);
          
          this.blogs = res.data || res;
          this.loading = false;
        },
        error: (err) => {
          this.errorMsg = 'Failed to load blogs';
          this.loading = false;
        }
      });
  }

  viewBlogDetail(blogId: number): void {
    this.router.navigate(['/blogs', blogId]);
  }
}
