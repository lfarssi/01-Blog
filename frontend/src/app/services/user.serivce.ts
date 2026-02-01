import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, of, map, throwError } from 'rxjs';
import { Router } from '@angular/router';

import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  PageResponse,
  UpdateProfileRequest,
  User,
} from '../models/user.model';
import { RegisterRequest } from '../models/auth.model';
import { BASE_URL } from './env';

import { MatSnackBar } from '@angular/material/snack-bar'; // ✅ add

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar); // ✅ add

  private apiUrl = `${BASE_URL}/users`;
  private authUrl = `${BASE_URL}/auth`;

  // Signals for reactive state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'current_user';

  constructor() {
    this.loadUserFromStorage();
  }

  /* ---------------- Auth ---------------- */

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/register`, request).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Registration failed. Please try again.'));
        return throwError(() => err);
      }),
    );
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, request).pipe(
      tap((response) => this.handleAuthSuccess(response)),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Login failed. Please try again.'));
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /* ---------------- Current User ---------------- */

  getCurrentUserId(): Observable<number> {
    const userId = this.currentUser()?.id || 0;
    return of(userId);
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/${userId}`).pipe(
      map((response) => response.data),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to load user.'));
        return throwError(() => err);
      }),
    );
  }

  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      }),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to load your profile.'));
        return throwError(() => err);
      }),
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, request).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      }),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to update profile.'));
        return throwError(() => err);
      }),
    );
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<User>(`${this.apiUrl}/me/avatar`, formData).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      }),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to upload avatar.'));
        return throwError(() => err);
      }),
    );
  }

  deleteAvatar(): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/me/avatar`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      }),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to delete avatar.'));
        return throwError(() => err);
      }),
    );
  }

  /* ---------------- Users Search / Admin ---------------- */

  searchUsers(query: string): Observable<User[]> {
    return this.http.get<any>(`${this.apiUrl}`, { params: { q: query } }).pipe(
      map((response) => {
        const users = response?.data || response?.users || [];
        return Array.isArray(users) ? users : [];
      }),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Search failed.'));
        return of([]); // ✅ safe fallback
      }),
    );
  }

  getAllUsers(page = 0, size = 20, searchTerm = ''): Observable<PageResponse> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (searchTerm.trim()) params = params.set('search', searchTerm.trim());

    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map((apiResponse: any) => apiResponse.data as PageResponse),
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to load users.'));
        return throwError(() => err);
      }),
    );
  }

  banUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/ban`, {}).pipe(
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to ban user.'));
        return throwError(() => err);
      }),
    );
  }

  unbanUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/unban`, {}).pipe(
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to unban user.'));
        return throwError(() => err);
      }),
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`).pipe(
      catchError((err) => {
        this.showError(this.extractMessage(err, 'Failed to delete user.'));
        return throwError(() => err);
      }),
    );
  }

  /* ---------------- Token helpers ---------------- */

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true;
    }
  }

  refreshAuthStatus(): void {
    if (this.getToken() && !this.isTokenExpired()) {
      this.getCurrentUserProfile().subscribe({
        error: () => this.logout(),
      });
    } else {
      this.logout();
    }
  }

  /* ---------------- Internals ---------------- */

  private handleAuthSuccess(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.saveUserToStorage(response.user);
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson && !this.isTokenExpired()) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch {
        this.logout();
      }
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  private extractMessage(err: any, fallback: string): string {
    if (err?.status === 0) return 'Cannot connect to server.';
    if (err?.status === 401) return 'Session expired. Please login again.';
    if (err?.status === 403) return 'Access denied.';
    return err?.error?.message || fallback;
  }
}
