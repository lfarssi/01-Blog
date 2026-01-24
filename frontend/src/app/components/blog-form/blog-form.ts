import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { BlogsService } from '../../services/blogs.service';

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
  ],
})
export class BlogFormComponent {
  private fb = inject(FormBuilder);
  private blogsService = inject(BlogsService);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(20)]],
  });

  // ✅ Multi-file signals - IMMEDIATE PREVIEWS
  loading = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  selectedFiles = signal<File[]>([]);
  dragOver = signal(false);
  mediaPreviews = signal<Map<string, string>>(new Map());

  readonly f = this.form.controls;
  readonly disabled = computed(() => this.loading() || this.selectedFiles().length === 4);

  // ✅ Drag & Drop - IMMEDIATE feedback
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
    const files = Array.from(event.dataTransfer!.files);
    this.processFiles(files);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.processFiles(files);
      input.value = '';
    }
  }

  // ✅ Process files IMMEDIATELY
  private processFiles(files: File[]): void {
    const currentFiles = this.selectedFiles();
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // 10MB
    const newFiles = [...currentFiles, ...validFiles].slice(0, 4);
    
    this.selectedFiles.set(newFiles);
    this.generateImmediatePreviews(newFiles);
  }

  // 🚀 IMMEDIATE PREVIEWS - No delay!
  private generateImmediatePreviews(files: File[]): void {
    const previews = new Map<string, string>(this.mediaPreviews());
    
    files.forEach(file => {
      const key = file.name + file.size;
      
      // ✅ IMMEDIATE placeholder
      previews.set(key, '');
      this.mediaPreviews.set(new Map(previews));
      
      // ✅ Async load
      const reader = new FileReader();
      reader.onload = () => {
        const updatedPreviews = new Map(this.mediaPreviews());
        updatedPreviews.set(key, reader.result as string);
        this.mediaPreviews.set(new Map(updatedPreviews));
      };
      reader.readAsDataURL(file);
    });
  }

  getPreviewUrl(file: File): string {
    return this.mediaPreviews().get(file.name + file.size) || 
           (this.isVideoFile(file) ? '' : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk1YTVhNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcgLi4uPC90ZXh0Pjwvc3ZnPg==');
  }

  isVideoFile(file: File): boolean {
    return file.type.startsWith('video/');
  }

  removeFile(file: File): void {
    this.selectedFiles.update(files => files.filter(f => f !== file));
    // ✅ Clean preview
    const previews = new Map(this.mediaPreviews());
    previews.delete(file.name + file.size);
    this.mediaPreviews.set(new Map(previews));
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const formData = new FormData();
    formData.append('title', this.form.value.title!);
    formData.append('content', this.form.value.content!);

    this.selectedFiles().forEach(file => {
      formData.append('media', file, file.name);
    });

    this.blogsService.createBlog(formData).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set(`Blog created with ${this.selectedFiles().length} media files! 🎉`);
        this.form.reset();
        this.selectedFiles.set([]);
        this.mediaPreviews.set(new Map());
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set('Failed to create blog: ' + (err.error?.message || 'Try again'));
        console.error('Blog error:', err);
      },
    });
  }
}
