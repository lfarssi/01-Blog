// src/app/services/notifications.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_URL } from './env';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);

  getAll(): Observable<any> {
    return this.http.get(`${BASE_URL}/notifications`);
  }

  getUnread(): Observable<any> {
    return this.http.get(`${BASE_URL}/notifications/unread`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${BASE_URL}/notifications/unread/count`);
  }

  markAsRead(notificationId: number): Observable<any> {
    return this.http.put(`${BASE_URL}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${BASE_URL}/notifications/read-all`, {});
  }

  delete(notificationId: number): Observable<any> {
    return this.http.delete(`${BASE_URL}/notifications/${notificationId}`);
  }
}
