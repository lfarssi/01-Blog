import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatInputModule, MatFormFieldModule, MatDialogContent, MatDialogActions],
  template: `
    <h2 mat-dialog-title>Report this post</h2>
    <mat-dialog-content class="py-3">
      <mat-form-field appearance="outline" class="w-100">
        <mat-label>Reason</mat-label>
        <textarea matInput 
                  [(ngModel)]="reason" 
                  rows="4" 
                  placeholder="Why are you reporting this post? (spam, inappropriate, etc.)"
                  required></textarea>
        @if (!reason) {
          <mat-error>Please provide a reason</mat-error>
        }
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="warn" 
              [disabled]="!reason.trim()"
              (click)="onReport()">
        Report ({{ blogId() }})
      </button>
    </mat-dialog-actions>
  `,
})
export class ReportDialog {
  dialogRef = inject(MatDialogRef<ReportDialog>);
  blogId = signal(inject<number>(MAT_DIALOG_DATA)); // WRAP plain data in signal

  reason = '';

  onReport() {
    if (this.reason.trim()) {
      this.dialogRef.close(this.reason.trim());
    }
  }
}
