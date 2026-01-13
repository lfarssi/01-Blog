import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Blog } from '../models/blog.model';

@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/blogs';

  getBlogs() {
    return this.http.get<{data:Blog[]}>(this.baseUrl);
  }

  getBlogById(id: number) {
    return this.http.get<Blog>(`${this.baseUrl}/${id}`);
  }
}
