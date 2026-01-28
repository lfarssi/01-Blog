import { Component, signal, inject, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.serivce';
import { User } from '../../models/user.model';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  users = signal<User[]>([]);
  isLoading = signal(false);

  globalSearch = new FormControl<string>('', { nonNullable: true });

  ngOnInit() {
    // initial load
    this.loadUsers('');

    // ✅ reactive debounced search (fix)
    this.globalSearch.valueChanges
      .pipe(
        map((v) => (v ?? '').trim()),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        // ✅ allow empty string to reset list
        this.loadUsers(term);
      });
  }

  loadUsers(searchTerm = '') {
    this.isLoading.set(true);

    this.userService.getAllUsers(0, 10, searchTerm).subscribe({
      next: (res: any) => {
        // ✅ support both shapes: {users: []} OR {data: []} OR [].
        const users: User[] = res?.users ?? res?.data ?? res ?? [];
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  // ✅ optional: manual search button
  searchUsers() {
    this.loadUsers(this.globalSearch.value.trim());
  }

  // ✅ optional: if you still call (input)="onSearch($event)" in HTML
  onSearch(event: Event) {
    const term = ((event.target as HTMLInputElement).value ?? '').trim();
    this.globalSearch.setValue(term, { emitEvent: true });
  }

  goToProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }
}
