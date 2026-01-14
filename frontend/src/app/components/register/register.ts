import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControlOptions,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    ReactiveFormsModule,
  ],
})
export class Register {
  readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly toast = inject(ToastService);

  errorMsg: string | null = null;
  loading = false;
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group(
    {
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [this.passwordMatchValidator] } as AbstractControlOptions
  );

  get f() {
    return this.form.controls;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(group: FormGroup): any {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Remove errorMsg/loading if using toast only
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please complete all fields correctly');
      return;
    }

    this.toast.info('Creating your account...');

    const body: RegisterRequest = {
      username: this.form.controls.username.value!,
      email: this.form.controls.email.value!,
      password: this.form.controls.password.value!,
    };

    this.authService.register(body).subscribe({
      next: () => {
        this.toast.success('Account created! Redirecting to login...');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Registration failed');
      },
    });
  }
}
