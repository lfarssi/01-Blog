import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,

    // ✅ Required for dialog layout directives
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title>Confirm</h2>

    <mat-dialog-content>
      {{ data.message }}
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <!-- ✅ boolean false -->
      <button mat-button [mat-dialog-close]="false">Cancel</button>

      <!-- ✅ boolean true -->
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,  
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { message: string },
  ) {}
}
