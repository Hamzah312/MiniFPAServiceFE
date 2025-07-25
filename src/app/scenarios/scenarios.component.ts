import { Component, OnInit, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

interface Scenario {
  id: number;
  name: string;
  version: string;
  description: string;
  createdDate: string;
  lastModified: string;
  recordCount: number;
}

@Component({
  selector: 'app-clone-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>Clone Scenario</h2>
    <mat-dialog-content>
      <form [formGroup]="cloneForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Scenario Name</mat-label>
          <input matInput formControlName="newName" placeholder="Enter new scenario name">
          <mat-error *ngIf="cloneForm.get('newName')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Version</mat-label>
          <input matInput formControlName="newVersion" placeholder="Enter new version">
          <mat-error *ngIf="cloneForm.get('newVersion')?.hasError('required')">
            Version is required
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!cloneForm.valid" (click)="onClone()">
        Clone
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class CloneDialogComponent {
  cloneForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CloneDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.cloneForm = this.fb.group({
      newName: ['', Validators.required],
      newVersion: ['v1', Validators.required]
    });
  }

  onClone() {
    if (this.cloneForm.valid) {
      this.dialogRef.close(this.cloneForm.value);
    }
  }
}

@Component({
  selector: 'app-scenarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card class="scenarios-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>scenario</mat-icon>
          Scenarios Management
        </mat-card-title>
        <mat-card-subtitle>View and manage financial planning scenarios</mat-card-subtitle>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="loadScenarios()" [disabled]="isLoading()">
            <mat-icon>refresh</mat-icon>
            Refresh
          </button>
        </div>
      </mat-card-header>

      <mat-progress-bar *ngIf="isLoading()" mode="indeterminate"></mat-progress-bar>

      <mat-card-content>
        <div class="table-container" *ngIf="scenarios().length > 0">
          <table mat-table [dataSource]="scenarios()" class="scenarios-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Scenario Name</th>
              <td mat-cell *matCellDef="let scenario">{{ scenario.name }}</td>
            </ng-container>

            <ng-container matColumnDef="version">
              <th mat-header-cell *matHeaderCellDef>Version</th>
              <td mat-cell *matCellDef="let scenario">{{ scenario.version }}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let scenario">{{ scenario.description || '-' }}</td>
            </ng-container>

            <ng-container matColumnDef="recordCount">
              <th mat-header-cell *matHeaderCellDef>Records</th>
              <td mat-cell *matCellDef="let scenario">{{ scenario.recordCount }}</td>
            </ng-container>

            <ng-container matColumnDef="lastModified">
              <th mat-header-cell *matHeaderCellDef>Last Modified</th>
              <td mat-cell *matCellDef="let scenario">{{ scenario.lastModified | date:'short' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let scenario">
                <button mat-icon-button color="primary" (click)="cloneScenario(scenario)" [disabled]="isLoading()">
                  <mat-icon>content_copy</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <div *ngIf="!isLoading() && scenarios().length === 0" class="no-data">
          <mat-icon>inbox</mat-icon>
          <p>No scenarios found. Upload some financial records to create scenarios.</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .scenarios-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      margin-left: auto;
    }

    .table-container {
      max-height: 600px;
      overflow: auto;
    }

    .scenarios-table {
      width: 100%;
    }

    .no-data {
      text-align: center;
      padding: 48px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #999;
    }
  `]
})
export class ScenariosComponent implements OnInit {
  scenarios = signal<Scenario[]>([]);
  isLoading = signal(false);
  displayedColumns = ['name', 'version', 'description', 'recordCount', 'lastModified', 'actions'];

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadScenarios();
  }

  loadScenarios() {
    this.isLoading.set(true);
    
    this.http.get<Scenario[]>('/api/Scenarios')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.scenarios.set(data);
          this.snackBar.open(`Loaded ${data.length} scenarios`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error loading scenarios:', error);
          this.snackBar.open('Failed to load scenarios', 'Close', { duration: 3000 });
          // Show mock data for demo purposes
          this.showMockData();
        }
      });
  }

  cloneScenario(scenario: Scenario) {
    const dialogRef = this.dialog.open(CloneDialogComponent, {
      width: '400px',
      data: { scenario }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.performClone(scenario, result.newName, result.newVersion);
      }
    });
  }

  private performClone(scenario: Scenario, newName: string, newVersion: string) {
    this.isLoading.set(true);
    
    const cloneRequest = {
      sourceScenario: scenario.name,
      sourceVersion: scenario.version,
      targetScenario: newName,
      targetVersion: newVersion
    };

    this.http.post('/api/Scenarios/clone', cloneRequest)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.snackBar.open('Scenario cloned successfully', 'Close', { duration: 3000 });
          this.loadScenarios(); // Refresh the list
        },
        error: (error) => {
          console.error('Error cloning scenario:', error);
          this.snackBar.open('Failed to clone scenario', 'Close', { duration: 3000 });
        }
      });
  }

  private showMockData() {
    const mockData: Scenario[] = [
      { 
        id: 1, 
        name: 'Budget2024', 
        version: 'v1', 
        description: 'Annual budget for 2024', 
        createdDate: '2024-01-01T00:00:00Z', 
        lastModified: '2024-01-15T10:30:00Z', 
        recordCount: 1250 
      },
      { 
        id: 2, 
        name: 'Forecast2024', 
        version: 'v2', 
        description: 'Q1 forecast revision', 
        createdDate: '2024-02-01T00:00:00Z', 
        lastModified: '2024-02-15T14:20:00Z', 
        recordCount: 890 
      },
      { 
        id: 3, 
        name: 'Budget2025', 
        version: 'v1', 
        description: 'Preliminary 2025 budget', 
        createdDate: '2024-03-01T00:00:00Z', 
        lastModified: '2024-03-10T09:45:00Z', 
        recordCount: 2100 
      }
    ];
    this.scenarios.set(mockData);
  }
}
