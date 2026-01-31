import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { NotificationsService } from '../../services/notifications.service';

type NotificationItem = {
  id: number;
  title?: string | null;
  content?: string | null; // backend field
  createdAt?: string | Date | null;
  isRead?: boolean | null; // backend field
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss'],
})
export class NotificationsComponent implements OnInit {
  notifications = signal<NotificationItem[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);

  // nice derived state (useful in template)
  unreadCount = computed(
    () => this.notifications().filter((n) => n.isRead === false).length,
  );

  private notificationsService = inject(NotificationsService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadNotifications();
  }

  private toast(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 2500,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  private extractErrorMessage(err: any, fallback: string): string {
    if (!err) return fallback;
    if (err.error) {
      if (typeof err.error.message === 'string') return err.error.message;
      if (typeof err.error.error === 'string') return err.error.error;
      if (Array.isArray(err.error.errors) && err.error.errors.length) {
        return err.error.errors.join(', ');
      }
    }
    if (err.status === 0) return 'Cannot reach server';
    return fallback;
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.notificationsService.getAll().subscribe({
      next: (res: any) => {
        const items: NotificationItem[] = res?.data ?? res ?? [];
        // normalize: ensure boolean value for isRead
        this.notifications.set(
          items.map((n) => ({ ...n, isRead: n.isRead === true })),
        );
        this.loading.set(false);
      },
      error: (err) => {
        const msg = this.extractErrorMessage(err, 'Failed to load notifications');
        this.errorMsg.set(msg);
        this.loading.set(false);
      },
    });
  }

  markAsRead(notificationId: number): void {
    // optimistic UI (instant)
    const before = this.notifications();
    this.notifications.update((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );

    this.notificationsService.markAsRead(notificationId).subscribe({
      next: () => {
        this.toast('Marked as read');
      },
      error: (err) => {
        // rollback
        this.notifications.set(before);
        this.toast(this.extractErrorMessage(err, 'Failed to mark as read'));
      },
    });
  }

  markAllAsRead(): void {
    const before = this.notifications();
    this.notifications.update((prev) => prev.map((n) => ({ ...n, isRead: true })));

    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.toast('All notifications marked as read');
      },
      error: (err) => {
        this.notifications.set(before);
        this.toast(this.extractErrorMessage(err, 'Failed to mark all as read'));
      },
    });
  }

  deleteNotification(notificationId: number): void {
    const before = this.notifications();
    this.notifications.update((prev) => prev.filter((n) => n.id !== notificationId));

    this.notificationsService.delete(notificationId).subscribe({
      next: () => {
        this.toast('Notification deleted');
      },
      error: (err) => {
        this.notifications.set(before);
        this.toast(this.extractErrorMessage(err, 'Failed to delete notification'));
      },
    });
  }

  trackById = (_: number, n: NotificationItem) => n.id;
}
