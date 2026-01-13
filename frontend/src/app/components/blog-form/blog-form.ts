import { Component, inject, signal, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BlogsService } from '../../services/blogs.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  templateUrl: './blog-form.html',
  styleUrls: ['./blog-form.scss'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    ReactiveFormsModule
  ]
})
export class BlogFormComponent {
  private fb = inject(FormBuilder);
  private blogsService = inject(BlogsService);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    content: ['', [Validators.required, Validators.minLength(20)]],
  });

  loading = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);

  readonly f = this.form.controls;
  readonly disabled = computed(() => this.loading() || this.form.invalid);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const payload = this.form.value as { title: string; content: string };

    this.blogsService.createBlog(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Blog post created successfully!');
        this.form.reset();
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to create blog post');
      }
    });
  }
}
