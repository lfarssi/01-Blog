import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { NotificationsService } from '../../services/notifications.service';

type NotificationItem = {
  id: number;
  title?: string | null;
  message?: string | null;
  createdAt?: string | Date | null;
  read?: boolean | null;
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './notifications.html',
})
export class NotificationsComponent implements OnInit {
  notifications = signal<NotificationItem[]>([]);
  loading = signal(true);
  errorMsg = signal<string | null>(null);

  private notificationsService = inject(NotificationsService);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.loading.set(true);
    this.errorMsg.set(null);

    this.notificationsService.getAll().subscribe({
      next: (res: any) => {
        const items: NotificationItem[] = res.data ?? res ?? [];
        this.notifications.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        console.log(err);
        this.errorMsg.set('Failed to load notifications');
        this.loading.set(false);
      },
    });
  }

  markAsRead(notificationId: number): void {
    this.notificationsService.markAsRead(notificationId).subscribe({
      next: () => {
        this.notifications.update((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  markAllAsRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((prev) => prev.map((n) => ({ ...n, read: true })));
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  deleteNotification(notificationId: number): void {
    this.notificationsService.delete(notificationId).subscribe({
      next: () => {
        this.notifications.update((prev) => prev.filter((n) => n.id !== notificationId));
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
