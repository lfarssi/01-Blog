import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

type ConfirmColor = 'primary' | 'accent' | 'warn';

export interface ConfirmDialogData {
  message: string;

  // ✅ optional customizations
  title?: string;        // default: "Confirm"
  confirmText?: string;  // default: "Confirm"
  cancelText?: string;   // default: "Cancel"
  confirmColor?: ConfirmColor; // default: "primary"
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions],
  template: `
    <h2 mat-dialog-title>{{ data.title ?? 'Confirm' }}</h2>

    <mat-dialog-content>
      {{ data.message }}
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        {{ data.cancelText ?? 'Cancel' }}
      </button>

      <button
        mat-raised-button
        [color]="data.confirmColor ?? 'primary'"
        [mat-dialog-close]="true"
      >
        {{ data.confirmText ?? 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}
}
