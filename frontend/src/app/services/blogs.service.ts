import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Blog } from '../models/blog.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BlogsService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/blogs';

  getBlogs(): Observable<{ data: Blog[] }> {
    return this.http.get<{ data: Blog[] }>(this.baseUrl);
  }

  createBlog(formData: { title: string; content: string }): Observable<Blog> {
    return this.http.post<Blog>(this.baseUrl, formData);
  }

  getBlog(id: string): Observable<{ data: Blog }> {
    return this.http.get<{ data: Blog }>(`${this.baseUrl}/${id}`);
  }
}
