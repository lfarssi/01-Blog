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
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BlogsService } from '../../services/blogs.service';
import { Blog } from '../../models/blog.model';

interface MediaItem {
  url: string;
  file?: File; // present only for new media
  isNew: boolean;
}

// ─────────────────────────────
// ✅ Trim-aware validators (spaces-only becomes invalid)
// ─────────────────────────────
function requiredTrimmed(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '');
    return v.trim().length ? null : { requiredTrimmed: true };
  };
}

function minLengthTrimmed(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = String(control.value ?? '');
    return v.trim().length >= min ? null : { minLengthTrimmed: { min } };
  };
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
    MatSnackBarModule,
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
  private snackBar = inject(MatSnackBar);

  // ─────────────────────────────
  // Core state
  // ─────────────────────────────
  blog = signal<Blog | null>(null);
  loading = signal(true);
  isSaving = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  /** 🔒 POST AVAILABILITY */
  isPostUnavailable = signal(false);

  // ─────────────────────────────
  // Unified Media (MAX 4)
  // ─────────────────────────────
  readonly MAX_MEDIA = 4;
  media = signal<MediaItem[]>([]);

  // Store initial existing media (so we can detect changes)
  private readonly API_BASE = 'http://localhost:8080';
  initialExistingMedia = signal<string[]>([]);

  readonly mediaCount = computed(() => this.media().length);
  readonly canAddMedia = computed(() => this.mediaCount() < this.MAX_MEDIA);

  // ─────────────────────────────
  // Form
  // ─────────────────────────────
  form = this.fb.group({
    title: ['', [requiredTrimmed(), minLengthTrimmed(5)]],
    content: ['', [requiredTrimmed(), minLengthTrimmed(20)]],
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
  // Error helpers
  // ─────────────────────────────
  private extractErrorMessage(err: any, fallback: string): string {
    if (!err) return fallback;

    if (err.error) {
      if (typeof err.error.message === 'string') return err.error.message;
      if (typeof err.error.error === 'string') return err.error.error;
      if (Array.isArray(err.error.errors) && err.error.errors.length) {
        return err.error.errors.join(', ');
      }
    }

    if (err.status === 0) return 'Cannot reach server';
    if (err.status === 401) return 'You must be logged in';
    if (err.status === 403) return 'You are not allowed to perform this action';
    if (err.status === 404) return 'Blog not found';
    if (err.status === 413) return 'One of the uploaded files is too large';
    if (err.status === 415) return 'Invalid media type (only images/videos allowed)';

    return fallback;
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  // ─────────────────────────────
  // Helpers
  // ─────────────────────────────
  isVideo(url: string): boolean {
    return /\.(mp4|mov|avi|wmv|webm)$/i.test(url);
  }

  // Normalize URL to compare against DB paths
  // "http://localhost:8080/api/uploads/x" -> "/api/uploads/x"
  private normalizeUrl(u: string): string {
    return u.startsWith(this.API_BASE) ? u.replace(this.API_BASE, '') : u;
  }

  // ─────────────────────────────
  // Load blog
  // ─────────────────────────────
  private loadBlog(id: number): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.isPostUnavailable.set(false);

    this.blogsService
      .getBlogById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          const blog = res.data ?? res;

          if ((blog as any)?.visible === false) {
            this.isPostUnavailable.set(true);
            const msg = 'This blog is hidden';
            this.errorMsg.set(msg);
            this.showError(msg);
            this.loading.set(false);
            return;
          }

          this.blog.set(blog);

          this.form.patchValue({
            title: blog.title,
            content: blog.content,
          });

          const existingMedia = this.parseMediaUrls(blog.media).map(
            (url): MediaItem => ({
              url,
              isNew: false,
            }),
          );

          const limited = existingMedia.slice(0, this.MAX_MEDIA);
          this.media.set(limited);

          // ✅ store initial existing media (urls) for change detection
          this.initialExistingMedia.set(limited.map((m) => m.url));

          this.loading.set(false);
        },
        error: (err) => {
          this.isPostUnavailable.set(true);

          const msg =
            err.status === 404
              ? 'This blog has been deleted'
              : err.status === 403
                ? 'You do not have access to this blog'
                : this.extractErrorMessage(err, 'Failed to load blog');

          this.errorMsg.set(msg);
          this.showError(msg);
          this.loading.set(false);
        },
      });
  }

  // ─────────────────────────────
  // Media actions
  // ─────────────────────────────
  onNewFilesSelected(event: Event): void {
    if (this.isPostUnavailable()) return;

    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = ['image/', 'video/'];

    const files = Array.from(input.files);

    for (const file of files) {
      if (!this.canAddMedia()) {
        this.showError(`Maximum ${this.MAX_MEDIA} media files allowed`);
        break;
      }

      const okType = allowedTypes.some((t) => file.type.startsWith(t));
      if (!okType) {
        this.showError(`Unsupported file type: ${file.name}`);
        continue;
      }

      if (file.size > maxSize) {
        this.showError(`File too large (max 10MB): ${file.name}`);
        continue;
      }

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
    }

    input.value = '';
  }

  removeMedia(index: number): void {
    if (this.isPostUnavailable()) return;

    this.media.update((list) => {
      const copy = [...list];
      copy.splice(index, 1);
      return copy;
    });
  }

  // ─────────────────────────────
  // Submit
  // Strategy:
  // - If media changed: send ONLY new files under key "media"
  //   (backend will delete all old media and replace)
  // - If no media change: send no files (backend won't touch media)
  // ─────────────────────────────
  submit(): void {
    if (this.isPostUnavailable()) {
      this.showError('This blog is no longer available');
      return;
    }

    if (this.form.invalid || this.mediaCount() > this.MAX_MEDIA) {
      this.form.markAllAsTouched();
      const msg = 'Fix form errors or reduce media';
      this.errorMsg.set(msg);
      this.showError(msg);
      return;
    }

    const blogId = this.blog()?.id;
    if (!blogId) return;

    this.isSaving.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const title = this.form.value.title?.trim() ?? '';
    const content = this.form.value.content?.trim() ?? '';

    if (!title || !content) {
      const msg = 'Title and content cannot be empty';
      this.errorMsg.set(msg);
      this.showError(msg);
      this.isSaving.set(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    // --- Robust media change detection (order-independent) ---
    const initialSet = new Set(
      this.initialExistingMedia().map((u) => this.normalizeUrl(u)),
    );

    const currentExistingSet = new Set(
      this.media()
        .filter((m) => !m.isNew)
        .map((m) => this.normalizeUrl(m.url)),
    );

    const removedSomething = [...initialSet].some(
      (u) => !currentExistingSet.has(u),
    );

    const hasNewFiles = this.media().some((m) => m.isNew && !!m.file);

    const hasMediaChanged = removedSomething || hasNewFiles;

    // ✅ IMPORTANT FIX: Controller expects part name "media" (NOT "mediaFiles")
    if (hasMediaChanged) {
      this.media()
        .filter((m) => m.isNew && m.file)
        .forEach((m) => formData.append('media', m.file!));
    }

    // Optional debug (remove later)
    // console.log('hasMediaChanged', hasMediaChanged);
    // console.log('new files count', this.media().filter(m => m.isNew && m.file).length);

    this.blogsService
      .updateBlog(blogId, formData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);

          const msg = 'Blog updated successfully';
          this.successMsg.set(msg);
          this.showSuccess(msg);

          setTimeout(() => this.router.navigate(['/blogs', blogId]), 900);
        },
        error: (err) => {
          this.isSaving.set(false);

          if (err.status === 404 || err.status === 410) {
            this.isPostUnavailable.set(true);
          }

          const msg =
            err.status === 404
              ? 'This blog has been deleted'
              : err.status === 403
                ? 'You are not allowed to update this blog'
                : this.extractErrorMessage(err, 'Update failed');

          this.errorMsg.set(msg);
          this.showError(msg);
        },
      });
  }

  deleteBlog(): void {
    if (this.isPostUnavailable()) {
      this.showError('This blog is no longer available');
      return;
    }

    if (!confirm('Delete this blog permanently?')) return;

    const blogId = this.blog()?.id;
    if (!blogId) return;

    this.blogsService
      .deleteBlog(blogId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => {
          const msg =
            err.status === 404
              ? 'This blog has already been deleted'
              : err.status === 403
                ? 'You are not allowed to delete this blog'
                : this.extractErrorMessage(err, 'Failed to delete blog');

          this.showError(msg);
        },
      });
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
    const BASE = this.API_BASE;

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
