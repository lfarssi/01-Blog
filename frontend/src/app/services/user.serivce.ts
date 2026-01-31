import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of, map } from 'rxjs';
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

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${BASE_URL}/users`;
  private authUrl = `${BASE_URL}/auth`;

  // Signals for reactive state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'current_user';

  constructor() {
    // Load user from localStorage on service initialization
    this.loadUserFromStorage();
  }

  /**
   * Register a new user
   */
  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authUrl}/register`, request)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  /**
   * Login user with credentials
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authUrl}/login`, request)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get current user's ID
   */
  getCurrentUserId(): Observable<number> {
    const userId = this.currentUser()?.id || 0;
    return of(userId);
  }
  /**
   * Get user by ID
   */
  getUserById(userId: number): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/${userId}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Get current user profile (from server)
   */
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      }),
    );
  }

  /**
   * Update current user's profile
   */
  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, request).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      }),
    );
  }

  /**
   * Upload user avatar
   */
  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<User>(`${this.apiUrl}/me/avatar`, formData).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      }),
    );
  }

  /**
   * Delete user avatar
   */
  deleteAvatar(): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/me/avatar`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.saveUserToStorage(user);
      }),
    );
  }

  /**
   * Search users by username or email
   */
  searchUsers(query: string): Observable<User[]> {
    return this.http
      .get<any>(`${this.apiUrl}`, {
        params: { q: query },
      })
      .pipe(
        map((response) => {
          const users = response.data || response.users || [];
          return Array.isArray(users) ? users : [];
        }),
        catchError((error) => {
          console.error('Search error:', error);
          return of([]);
        }),
      );
  }
  /**
   * Get all users (Admin only)
   */
  // UserService.getAllUsers()
  getAllUsers(page = 0, size = 20, searchTerm = ''): Observable<PageResponse> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (searchTerm.trim()) params = params.set('search', searchTerm.trim());

    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map((apiResponse: any) => apiResponse.data as PageResponse), // ✅ Extract data!
    );
  }

  /**
   * Ban a user (Admin only)
   */
  banUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/ban`, {});
  }

  /**
   * Unban a user (Admin only)
   */
  unbanUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${userId}/unban`, {});
  }

  /**
   * Delete a user (Admin only)
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiry;
    } catch (e) {
      return true;
    }
  }

  /**
   * Refresh authentication status
   */
  refreshAuthStatus(): void {
    if (this.getToken() && !this.isTokenExpired()) {
      this.getCurrentUserProfile().subscribe({
        error: () => this.logout(),
      });
    } else {
      this.logout();
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    this.saveUserToStorage(response.user);
    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  /**
   * Save user to localStorage
   */
  private saveUserToStorage(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Load user from localStorage on initialization
   */
  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem(this.USER_KEY);

    if (token && userJson && !this.isTokenExpired()) {
      try {
        const user = JSON.parse(userJson);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (e) {
        this.logout();
      }
    }
  }
}
