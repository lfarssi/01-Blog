import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router

// Define the response interface to match your backend
interface LoginResponse {
  status: number;
  message: string;
  data: {
    token: string;
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
    ReactiveFormsModule
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
    private router: Router // Inject Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
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
      username: this.form.value.username,
      password: this.form.value.password
    };

    this.http.post<LoginResponse>('http://localhost:8080/api/auth/login', body)
      .subscribe({
        next: (res) => {
          this.loading = false;
          console.log(res);
          
          // Access token from nested data object
          localStorage.setItem('token', res.data.token);
          
          // Navigate to home page
          this.router.navigate(['/blogs']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Invalid username/email or password';
        }
      });
  }
}
