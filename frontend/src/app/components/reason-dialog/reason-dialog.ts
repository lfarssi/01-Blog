import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reason-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Report Reason</h2>

    <mat-dialog-content class="reason-content">
      {{ data.reason }}
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .reason-content {
        white-space: pre-wrap;
        line-height: 1.6;
        font-size: 14px;
        padding-top: 8px;
        max-height: 60vh;
        overflow: auto;
      }
    `,
  ],
})
export class ReasonDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { reason: string }) {}
}
