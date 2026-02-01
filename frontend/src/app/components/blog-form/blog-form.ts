import { Component, inject, signal, computed } from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { BlogsService } from '../../services/blogs.service';
import { Router } from '@angular/router';

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
  selector: 'app-blog-form',
  standalone: true,
  templateUrl: './blog-form.html',
  styleUrls: ['./blog-form.scss'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
})
export class BlogFormComponent {
  private fb = inject(FormBuilder);
  private blogsService = inject(BlogsService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  /* ================= FORM ================= */

  // ✅ spaces-only invalid + trimmed length
  form = this.fb.group({
    title: ['', [requiredTrimmed(), minLengthTrimmed(5)]],
    content: ['', [requiredTrimmed(), minLengthTrimmed(20)]],
  });

  /* ================= STATE ================= */

  loading = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  selectedFiles = signal<File[]>([]);
  dragOver = signal(false);
  mediaPreviews = signal<Map<string, string>>(new Map());

  readonly f = this.form.controls;
  readonly disabled = computed(
    () => this.loading() || this.selectedFiles().length > 4,
  );

  /* ================= DRAG & DROP ================= */

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const files = Array.from(event.dataTransfer?.files || []);
    this.processFiles(files);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  /* ================= FILE HANDLING ================= */

  private processFiles(files: File[]): void {
    const allowedTypes = ['image/', 'video/'];
    const maxSize = 10 * 1024 * 1024;

    const validFiles: File[] = [];

    for (const file of files) {
      const validType = allowedTypes.some(t => file.type.startsWith(t));
      const validSize = file.size <= maxSize;

      if (!validType) {
        this.showError(`Unsupported file type: ${file.name}`);
        continue;
      }

      if (!validSize) {
        this.showError(`File too large (max 10MB): ${file.name}`);
        continue;
      }

      validFiles.push(file);
    }

    const merged = [...this.selectedFiles(), ...validFiles].slice(0, 4);
    this.selectedFiles.set(merged);
    this.generateImmediatePreviews(merged);
  }

  private generateImmediatePreviews(files: File[]): void {
    const previews = new Map(this.mediaPreviews());

    files.forEach(file => {
      const key = file.name + file.size;

      if (previews.has(key)) return;

      previews.set(key, '');
      this.mediaPreviews.set(new Map(previews));

      const reader = new FileReader();
      reader.onload = () => {
        const updated = new Map(this.mediaPreviews());
        updated.set(key, reader.result as string);
        this.mediaPreviews.set(updated);
      };
      reader.readAsDataURL(file);
    });
  }

  getPreviewUrl(file: File): string {
    return (
      this.mediaPreviews().get(file.name + file.size) ||
      (this.isVideoFile(file)
        ? ''
        : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk1YTVhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcgLi4uPC90ZXh0Pjwvc3ZnPg==')
    );
  }

  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  removeFile(file: File): void {
    this.selectedFiles.update(files => files.filter(f => f !== file));
    const previews = new Map(this.mediaPreviews());
    previews.delete(file.name + file.size);
    this.mediaPreviews.set(previews);
  }

  formatFileSize(bytes: number): string {
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /* ================= SUBMIT ================= */

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const title = this.form.value.title?.trim() ?? '';
    const content = this.form.value.content?.trim() ?? '';

    // Extra safety: if somehow whitespace slips through
    if (!title || !content) {
      const msg = 'Title and content cannot be empty';
      this.errorMsg.set(msg);
      this.showError(msg);
      this.loading.set(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);

    this.selectedFiles().forEach(file => {
      formData.append('media', file, file.name);
    });

    this.blogsService.createBlog(formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set(
          `Blog created with ${this.selectedFiles().length} media files 🎉`,
        );
        this.form.reset();
        this.selectedFiles.set([]);
        this.mediaPreviews.set(new Map());
        this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);

        let message = 'Failed to create blog. Please try again.';

        if (err.status === 400 && err.error?.message) {
          message = err.error.message;
        } else if (err.status === 413) {
          message = 'One of the uploaded files is too large.';
        } else if (err.status === 415) {
          message = 'Invalid media type detected.';
        } else if (err.error?.errors?.length) {
          message = err.error.errors.join(', ');
        }

        this.errorMsg.set(message);
        this.showError(message);

      },
    });
  }

  /* ================= UI HELPERS ================= */

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }
}
