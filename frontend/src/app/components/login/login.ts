import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';

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
    ReactiveFormsModule
  ]
})
export class Login {
  form: FormGroup;
  errorMsg: string | null = null;
  loading = false;
  showPassword = false;

  // inject HttpClient
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
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
      email: this.form.value.email,
      password: this.form.value.password
    };

    // change URL to your backend login endpoint
    this.http.post<{ token: string }>('http://localhost:8080/api/auth/login', body)
      .subscribe({
        next: (res) => {
          this.loading = false;
          // example: save token and redirect
          localStorage.setItem('token', res.token);
          // TODO: navigate to home/dashboard
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Invalid email or password';
        }
      });
  }
}