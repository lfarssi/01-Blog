import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';  // ADD THIS
import { BASE_URL } from '../../services/env';

// Updated interface to match backend
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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterLink
]
})
export class Login {
  form: FormGroup;
  errorMsg: string | null = null;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private router: Router,
    private authService: AuthService  // ADD THIS
  ) {
    this.form = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get f() {
    return this.form.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = null;

    const body = {
      usernameOrEmail: this.form.value.usernameOrEmail,
      password: this.form.value.password
    };

    this.http.post<LoginResponse>(`${BASE_URL}/auth/login`, body)
      .subscribe({
        next: (res) => {
          this.loading = false;
          
          // Use AuthService
          const userData = res.data;
          this.authService.setAuthData(userData.token, {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role as 'ADMIN' | 'USER'
          });
          console.log(res);
          
          
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Invalid credentials';
        }
      });
  }
}
