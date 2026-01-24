import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BlogsService } from '../../services/blogs.service';
import { Blog } from '../../models/blog.model';

interface MediaItem {
  url: string;
  file?: File;     // present only for new media
  isNew: boolean;
}

@Component({
  selector: 'app-edit-blog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './edit-blog.html',
  styleUrls: ['./edit-blog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditBlogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private blogsService = inject(BlogsService);
  private destroyRef = inject(DestroyRef);

  // ─────────────────────────────
  // Core state
  // ─────────────────────────────
  blog = signal<Blog | null>(null);
  loading = signal(true);
  isSaving = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  // ─────────────────────────────
  // Unified Media (MAX 4)
  // ─────────────────────────────
  readonly MAX_MEDIA = 4;
  media = signal<MediaItem[]>([]);

  readonly mediaCount = computed(() => this.media().length);
  readonly canAddMedia = computed(() => this.mediaCount() < this.MAX_MEDIA);

  // ─────────────────────────────
  // Form
  // ─────────────────────────────
  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(20)]],
  });

  readonly f = this.form.controls;

  ngOnInit(): void {
    const blogId = Number(this.route.snapshot.paramMap.get('id'));
    if (!blogId) {
      this.router.navigate(['/']);
      return;
    }
    this.loadBlog(blogId);
  }

  // ─────────────────────────────
  // Helpers
  // ─────────────────────────────
  isVideo(url: string): boolean {
    return /\.(mp4|mov|avi|wmv|webm)$/i.test(url);
  }

  // ─────────────────────────────
  // Load blog
  // ─────────────────────────────
  private loadBlog(id: number): void {
    this.loading.set(true);

    this.blogsService
      .getBlogById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const blog = res.data ?? res;
          this.blog.set(blog);

          this.form.patchValue({
            title: blog.title,
            content: blog.content,
          });

          const existingMedia = this.parseMediaUrls(blog.media).map(
            (url): MediaItem => ({
              url,
              isNew: false,
            })
          );

          this.media.set(existingMedia.slice(0, this.MAX_MEDIA));
          this.loading.set(false);
        },
        error: () => {
          this.errorMsg.set('Failed to load blog');
          this.loading.set(false);
        },
      });
  }

  // ─────────────────────────────
  // Media actions
  // ─────────────────────────────
  onNewFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files).filter(
      (f) => f.size <= 10 * 1024 * 1024
    );

    files.forEach((file) => {
      if (!this.canAddMedia()) return;

      const reader = new FileReader();
      reader.onload = () => {
        this.media.update((list) => [
          ...list,
          {
            url: reader.result as string,
            file,
            isNew: true,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeMedia(index: number): void {
    this.media.update((list) => {
      const copy = [...list];
      copy.splice(index, 1);
      return copy;
    });
  }

  // ─────────────────────────────
  // Submit
  // ─────────────────────────────
  submit(): void {
    if (this.form.invalid || this.mediaCount() > this.MAX_MEDIA) {
      this.form.markAllAsTouched();
      this.errorMsg.set('Fix form errors or reduce media');
      return;
    }

    const blogId = this.blog()?.id;
    if (!blogId) return;

    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const formData = new FormData();
    formData.append('title', this.form.value.title!);
    formData.append('content', this.form.value.content!);

    // Existing media (keep)
    const keptMedia = this.media()
      .filter((m) => !m.isNew)
      .map((m) => m.url);

    formData.append('existingMedia', JSON.stringify(keptMedia));

    // New media
    this.media()
      .filter((m) => m.isNew && m.file)
      .forEach((m) => formData.append('newMedia', m.file!));

    this.blogsService
      .updateBlog(blogId, formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMsg.set('Blog updated successfully');
          setTimeout(() => this.router.navigate(['/blogs', blogId]), 1200);
        },
        error: () => {
          this.isSaving.set(false);
          this.errorMsg.set('Update failed');
        },
      });
  }

  deleteBlog(): void {
    if (!confirm('Delete this blog permanently?')) return;

    const blogId = this.blog()?.id;
    if (!blogId) return;

    this.blogsService
      .deleteBlog(blogId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.router.navigate(['/']));
  }

  cancel(): void {
    const blogId = this.blog()?.id;
    this.router.navigate(['/blogs', blogId ?? '']);
  }

  // ─────────────────────────────
  // Media parsing
  // ─────────────────────────────
  private parseMediaUrls(media: string | string[] | undefined): string[] {
    if (!media) return [];
    const BASE = 'http://localhost:8080';

    if (Array.isArray(media)) {
      return media.map((m) => (m.startsWith('http') ? m : BASE + m));
    }

    try {
      const parsed = JSON.parse(media);
      return Array.isArray(parsed)
        ? parsed.map((m: string) => (m.startsWith('http') ? m : BASE + m))
        : [];
    } catch {
      return [media.startsWith('http') ? media : BASE + media];
    }
  }
}
