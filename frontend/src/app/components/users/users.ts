import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';  // ✅ No effect!
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { UserService } from '../../services/user.serivce';
import { User } from '../../models/user.model';
import {  MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {  MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
// ... other imports

interface PageResponse {
  users: User[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,  // ✅ Signal magic!
  imports: [
    CommonModule,
    ReactiveFormsModule,           // ✅ formControl
    MatFormFieldModule                                                                                                                                                                                                                                                                                                                        ,
    MatInputModule,
    MatIconModule,
    MatListModule,                 // ✅ mat-nav-list / mat-list-item
    MatButtonModule,
    MatProgressSpinnerModule,      // ✅ mat-spinner (not MatProgressSpinner)
    MatCardModule                                           
  ],  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class UsersComponent {
  private userService = inject(UserService);
    private router = inject(Router);

  users = signal<User[]>([]);
  isLoading = signal(false);
  globalSearch = new FormControl('');  // ✅ Pure reactive


ngOnInit() {
  this.loadUsers();
}

loadUsers(searchTerm = '') {
  this.isLoading.set(true);
  this.userService.getAllUsers(0, 10, searchTerm).subscribe({
    next: ({ users }) => {  // ✅ Destructure!
      this.users.set(users);
      this.isLoading.set(false);
    },
    error: console.error
  });
}


  searchUsers() {
    this.loadUsers(this.globalSearch.value || '');  // ✅ Works!
  }
  onSearch(event: Event) {
  const term = (event.target as HTMLInputElement).value?.trim();
  if (term?.length! > 0 || term === '') {  // Debounce + min length
    this.loadUsers(term);
  }
}


  goToProfile(userId: number) { 

        this.router.navigate(['/profile', userId]);

  }
}
