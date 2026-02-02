  import { Injectable, inject, signal, computed } from '@angular/core';
  import { Router } from '@angular/router';
  import { User } from '../models/user.model';

  @Injectable({
    providedIn: 'root'
  })
  export class AuthService {
    private readonly TOKEN_KEY = 'token';
    private readonly USER_KEY = 'current_user';  // Store user data
    
    private router = inject(Router);
    
    // Reactive user state
    private _currentUser = signal<User | null>(null);
    currentUser = this._currentUser.asReadonly();
    
    // Computed auth states (reactive!)
    isLoggedIn = computed(() => !!this.currentUser());
    
    isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

    constructor() {
      // Restore user from storage on init
      this.restoreAuthState();
    }

    // Save token AND user (from login response)
    setAuthData(token: string, user: User): void {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this._currentUser.set(user);
    }

    // Get token
    getToken(): string | null {
      return localStorage.getItem(this.TOKEN_KEY);
    }



    // Restore auth state on app load
    private restoreAuthState(): void {
      const token = this.getToken();
      const userStr = localStorage.getItem(this.USER_KEY);
      
      if (token && userStr) {
        try {
          const user: User = JSON.parse(userStr);
          this._currentUser.set(user);
        } catch {
          this.logout();
        }
      }
    }

    // Logout
    logout(): void {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      this._currentUser.set(null);
      this.router.navigateByUrl('/auth/login');
    }

    // Backend login/register calls would use:
    // login(credentials): Observable<{token: string, user: User}>
    //   .subscribe(({token, user}) => this.setAuthData(token, user));
  }
