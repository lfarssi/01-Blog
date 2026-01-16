import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
// CORRECT Material imports - each from its own module
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,    // Module, not component
    MatButtonModule,     // Module
    MatIconModule        // Module
  ]
})
export class Header {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  user = this.authService.currentUser;
  isLoggedIn = computed(() => !!this.user());
  isAdmin = computed(() => this.user()?.role === 'ADMIN');
  goToProfile(): void {
    this.router.navigate(['/profile', this.user()?.id]);
    // Or /users/{id} for public profile
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
