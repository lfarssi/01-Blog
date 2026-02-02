import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { BASE_URL } from '../../services/env';

interface LoginResponse {
  status: number;
  message: string;
  data: {
    token: string;
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class Login {
  form: FormGroup;
  errorMsg = signal<string | null>(null);
  loading = signal(false);
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    // Clear error when user types
    this.form.valueChanges.subscribe(() => {
      this.errorMsg.set(null);
    });
  }

  get f() {
    return this.form.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    this.errorMsg.set( null); // Clear previous errors

    if (this.form.invalid) {
      this.form.markAllAsTouched(); // ✅ Shows errors on submit for untouched fields
      return;
    }

    this.loading.set(true);

    const body = {
      usernameOrEmail: this.form.value.usernameOrEmail?.trim(),
      password: this.form.value.password,
    };
    setTimeout(() => {
      this.http.post<LoginResponse>(`${BASE_URL}/auth/login`, body).subscribe({
        next: (res) => {
          this.loading.set( false);
          const userData = res.data;
          this.authService.setAuthData(userData.token, {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role as 'ADMIN' | 'USER',
          });
          this.router.navigate(['/']);
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set( false);
          const backendMessage =
            err.error?.message ||
            err.error?.error ||
            err.error?.msg ||
            (typeof err.error === 'string' ? err.error : null);

          if (err.status === 0) {
            this.errorMsg .set('Cannot reach server. Is backend running?');
            return;
          }
          if (err.status === 403) {
            this.errorMsg.set(backendMessage ?? 'Your account is banned.');
            return;
          }
          if (err.status === 401) {
            this.errorMsg.set(backendMessage ?? 'Invalid credentials.');
            return;
          }
          this.errorMsg.set(backendMessage ?? `Login failed (HTTP ${err.status}).`);
        },
      });
    }, 0);
  }
}
