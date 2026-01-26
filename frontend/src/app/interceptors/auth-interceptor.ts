// auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const token = localStorage.getItem('token');

  const authReq = token
    ? req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Backend should return 401/403 for banned users
      if (err.status === 401 || err.status === 403) {
        authService.logout(); // must clear token + user signal/state
        router.navigate(['/auth/login'], { queryParams: { reason: 'banned_or_expired' } });
      }
      return throwError(() => err);
    })
  );
};
