import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Material imports
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatError } from '@angular/material/form-field';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { BlogsService } from '../../services/blogs.service';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-edit-blog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatError,
    MatProgressSpinner
  ],
  templateUrl: './edit-blog.html',
  styleUrls: ['./edit-blog.scss']
})
export class EditBlogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private blogsService = inject(BlogsService);

  // Signals
  blog = signal<Blog | null>(null);
  loading = signal(false);
  isSaving = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // ✅ NEW: Media management
  currentMediaUrls = signal<string[]>([]);           // Current media URLs
  mediaToDelete = signal<number[]>([]);              // Indices to delete
  newMediaPreviews = signal<string[]>([]);           // New media previews
  newMediaFiles: File[] = [];                        // New files

  // Form
  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(20)]]
  });

  readonly f = this.form.controls;
  readonly disabled = computed(() => this.isSaving());
  readonly totalMediaCount = computed(() => 
    this.currentMediaUrls().length - this.mediaToDelete().length + this.newMediaFiles.length
  );

  ngOnInit(): void {
    const blogId = Number(this.route.snapshot.paramMap.get('id'));
    if (blogId) {
      this.loadBlog(blogId);
    }
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    return /\.(mp4|avi|mov|wmv|flv|webm)$/i.test(url);
  }

  private loadBlog(id: number): void {
    this.blogsService.getBlogById(id).subscribe({
      next: (res: any) => {
        const blogData = res.data;
        this.blog.set(blogData);
        this.form.patchValue({ title: blogData.title, content: blogData.content });

        // ✅ Load ALL current media
        if (blogData.media) {
          const mediaUrls = this.parseMediaUrls(blogData.media);
          this.currentMediaUrls.set(mediaUrls);
        }
      },
      error: (err: any) => {
        this.errorMsg.set('Failed to load blog');
        console.error(err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFile = input.files[0];
      
      // ✅ Max 4 total media
      if (this.totalMediaCount() >= 4) {
        alert('Maximum 4 media files allowed');
        return;
      }

      this.newMediaFiles.push(newFile);
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        this.newMediaPreviews.update(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(newFile);
    }
  }

  /** ✅ Delete current media (X button) */
  deleteCurrentMedia(index: number): void {
    this.mediaToDelete.update(ids => {
      if (ids.includes(index)) return ids;
      return [...ids, index];
    });
  }

  /** ✅ Undo delete */
  undoDelete(index: number): void {
    this.mediaToDelete.update(ids => ids.filter(id => id !== index));
  }

  /** ✅ Remove new media */
  removeNewMedia(index: number): void {
    this.newMediaFiles.splice(index, 1);
    this.newMediaPreviews.update(prev => {
      prev.splice(index, 1);
      return [...prev];
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const blogId = this.blog()?.id;
    if (!blogId) return;

    this.isSaving.set(true);

    const formData = new FormData();
    formData.append('title', this.form.value.title!);
    formData.append('content', this.form.value.content!);

    // ✅ Send new media files
    this.newMediaFiles.forEach(file => formData.append('media', file));

    // ✅ Send delete indices
    if (this.mediaToDelete().length > 0) {
      formData.append('deleteMediaIndices', JSON.stringify(this.mediaToDelete()));
    }

    this.blogsService.updateBlog(blogId, formData).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.successMsg.set('Blog updated successfully!');
        setTimeout(() => this.router.navigate(['/blogs', blogId]), 1500);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMsg.set('Failed to update blog');
        console.error(err);
      }
    });
  }

  deleteBlog(): void {
    if (confirm('Are you sure you want to delete this blog?')) {
      const blogId = this.blog()?.id;
      if (blogId) {
        this.blogsService.deleteBlog(blogId).subscribe({
          next: () => this.router.navigate(['/']),
          error: (err) => {
            this.errorMsg.set('Failed to delete blog');
            console.error(err);
          }
        });
      }
    }
  }

  cancel(): void {
    const blogId = this.blog()?.id;
    this.router.navigate(['/blogs', blogId]);
  }

  private parseMediaUrls(media: string | string[] | undefined): string[] {
    if (!media) return [];
    const BACKEND_URL = 'http://localhost:8080';

    if (Array.isArray(media)) {
      return media.map(url => url.startsWith('http') ? url : `${BACKEND_URL}${url}`);
    }

    try {
      const parsed = JSON.parse(media);
      return Array.isArray(parsed)
        ? parsed.map(url => url.startsWith('http') ? url : `${BACKEND_URL}${url}`)
        : [`${BACKEND_URL}${media}`];
    } catch {
      return [`${BACKEND_URL}${media}`];
    }
  }
}
