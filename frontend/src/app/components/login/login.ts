import { Component, inject, NgModule } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loading = false;
  errorMsg = '';

  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  constructor(fb: FormBuilder, private http: HttpClient) {}

  submit() {
    this.errorMsg = '';
    if (this.form.invalid) return;

    this.loading = true;
    this.http.post('/api/auth/login', this.form.value).subscribe({
      next: (res) => {
        this.loading = false;
        // store token, navigate, etc.
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'Login failed';
      }
    });
  }

  get f() { return this.form.controls; }
}
