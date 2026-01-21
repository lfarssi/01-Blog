import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UserService } from '../../services/user.serivce';
import { User } from '../../models/user.model';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule, MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

interface PageResponse {
  users: User[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatProgressSpinner, MatIconModule,
    MatFormFieldModule, MatInputModule, MatListModule, MatButtonModule, MatCardModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent {
  private userService = inject(UserService);
  users = signal<User[]>([]);
  isLoading = signal(false);
  globalSearch = new FormControl('');

  constructor() {
    this.loadUsers();
    effect(() => {
      this.globalSearch.valueChanges.subscribe(() => this.searchUsers());
    });
  }

loadUsers(searchTerm = '') {
    this.isLoading.set(true);
    this.userService.getAllUsers(0, 10).subscribe({
      next: (response: PageResponse) => {
        this.users.set(response.users || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  searchUsers() {
    const term = this.globalSearch.value || '';
      this.loadUsers(term); // Reuse same method

  }

  // toggleFollow(userId: number) {
  //   // Toggle follow/unfollow via service
  //   this.userService.toggleFollow(userId).subscribe(() => {
  //     this.searchUsers(); // Refresh list
  //   });
  // }

  goToProfile(userId: number) {
    // Navigate to profile
  }
}
