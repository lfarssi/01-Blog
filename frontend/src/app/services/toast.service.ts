import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly snackbar = inject(MatSnackBar);

    show(message: string, type: ToastType = 'info', duration = 4000, action = 'OK'): void {
    const config: MatSnackBarConfig = {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [`toast-${type}`, 'toast-modern'],
      politeness: 'assertive'
    };
    this.snackbar.open(message, action, config);
  }

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this.show(message, 'error', duration, 'Close');
  }

  info(message: string, duration = 4000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 5000): void {
    this.show(message, 'warning', duration);
  }
}
