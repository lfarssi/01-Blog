import { Component, inject, computed, signal,effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../services/user.serivce';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class Header {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  user = this.authService.currentUser;
  isLoggedIn = computed(() => !!this.user());

  isAdmin = computed(() => this.user()?.role === 'ADMIN');

  // Search state
  showSearch = false;
  searchQuery = '';
  searchResults = signal<any[]>([]);
     private darkMode = signal(
    localStorage.getItem('theme') === 'dark'
  );

  isDarkMode = this.darkMode.asReadonly();
  // private logRoleEffect = effect(() => {
  //   const u = this.user();
  //   console.log('[Header] currentUser role:', u?.role ?? 'NO_USER');
  // });
  toggleTheme() {
    const isDark = !this.darkMode();
    this.darkMode.set(isDark);

    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  goToProfile(): void {
    const currentUserId = this.user()?.id;
    if (currentUserId) {
      this.router.navigate(['/profile', currentUserId]);
    }
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.clearSearch();
    }
  }

  searchUsers(): void {
    if (this.searchQuery.length < 2) {
      this.searchResults.set([]);
      return;
    }
    // Replace with your UserService.searchUsers(query)
    this.userService.searchUsers(this.searchQuery).subscribe((users) => {
      this.searchResults.set(users);
    });
  }

  goToUserProfile(userId: number): void {
    this.router.navigate(['/profile', userId]);
    this.clearSearch();
  }
  goToNotifications() {
    this.router.navigate(['/notifications']);
  }
  createBlog(): void {
    this.router.navigate(['/create_blog']);
    this.clearSearch();
  }

  clearSearch(): void {
    this.showSearch = false;
    this.searchQuery = '';
    this.searchResults.set([]);
  }

  logout(): void {
    this.authService.logout();
  }
}
