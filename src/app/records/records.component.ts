import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

interface FinancialRecord {
  id: number;
  scenario: string;
  version: string;
  account: string;
  period: string;
  amount: number;
  currency: string;
  uploadDate: string;
}

@Component({
  selector: 'app-records',
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
    MatSnackBarModule
  ],
  template: `
    <mat-card class="filter-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>filter_list</mat-icon>
          Filter Records
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="filterForm" (ngSubmit)="loadRecords()" class="filter-form">
          <mat-form-field appearance="outline">
            <mat-label>Scenario</mat-label>
            <input matInput formControlName="scenario" placeholder="Enter scenario name">
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Version</mat-label>
            <input matInput formControlName="version" placeholder="Enter version">
          </mat-form-field>
          
          <button mat-raised-button color="primary" type="submit" [disabled]="isLoading()">
            <mat-icon>search</mat-icon>
            Load Records
          </button>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card class="records-card" *ngIf="records().length > 0 || isLoading()">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>table_view</mat-icon>
          Financial Records ({{ records().length }})
        </mat-card-title>
      </mat-card-header>
      
      <mat-progress-bar *ngIf="isLoading()" mode="indeterminate"></mat-progress-bar>
      
      <mat-card-content>
        <div class="table-container">
          <table mat-table [dataSource]="records()" class="records-table">
            <ng-container matColumnDef="scenario">
              <th mat-header-cell *matHeaderCellDef>Scenario</th>
              <td mat-cell *matCellDef="let record">{{ record.scenario }}</td>
            </ng-container>

            <ng-container matColumnDef="version">
              <th mat-header-cell *matHeaderCellDef>Version</th>
              <td mat-cell *matCellDef="let record">{{ record.version }}</td>
            </ng-container>

            <ng-container matColumnDef="account">
              <th mat-header-cell *matHeaderCellDef>Account</th>
              <td mat-cell *matCellDef="let record">{{ record.account }}</td>
            </ng-container>

            <ng-container matColumnDef="period">
              <th mat-header-cell *matHeaderCellDef>Period</th>
              <td mat-cell *matCellDef="let record">{{ record.period }}</td>
            </ng-container>

            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let record">{{ record.amount | currency:record.currency }}</td>
            </ng-container>

            <ng-container matColumnDef="uploadDate">
              <th mat-header-cell *matHeaderCellDef>Upload Date</th>
              <td mat-cell *matCellDef="let record">{{ record.uploadDate | date:'short' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>

    <div *ngIf="!isLoading() && records().length === 0" class="no-data">
      <mat-icon>inbox</mat-icon>
      <p>No records found. Use the filter above to search for records.</p>
    </div>
  `,
  styles: [`
    .filter-card {
      margin-bottom: 24px;
    }

    .filter-form {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .filter-form mat-form-field {
      min-width: 200px;
    }

    .records-card {
      margin-bottom: 24px;
    }

    .table-container {
      max-height: 500px;
      overflow: auto;
    }

    .records-table {
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
export class RecordsComponent implements OnInit {
  filterForm: FormGroup;
  records = signal<FinancialRecord[]>([]);
  isLoading = signal(false);
  displayedColumns = ['scenario', 'version', 'account', 'period', 'amount', 'uploadDate'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.fb.group({
      scenario: [''],
      version: ['']
    });
  }

  ngOnInit() {
    // Load some sample data by default
    this.loadRecords();
  }

  loadRecords() {
    this.isLoading.set(true);
    const { scenario, version } = this.filterForm.value;
    
    let url = '/api/Records';
    const params = new URLSearchParams();
    if (scenario) params.append('scenario', scenario);
    if (version) params.append('version', version);
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    this.http.get<FinancialRecord[]>(url)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.records.set(data);
          this.snackBar.open(`Loaded ${data.length} records`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error loading records:', error);
          this.snackBar.open('Failed to load records', 'Close', { duration: 3000 });
          // Show mock data for demo purposes
          this.showMockData();
        }
      });
  }

  private showMockData() {
    const mockData: FinancialRecord[] = [
      { id: 1, scenario: 'Budget2024', version: 'v1', account: 'Revenue', period: '2024-01', amount: 150000, currency: 'USD', uploadDate: '2024-01-15T10:30:00Z' },
      { id: 2, scenario: 'Budget2024', version: 'v1', account: 'Expenses', period: '2024-01', amount: -120000, currency: 'USD', uploadDate: '2024-01-15T10:30:00Z' },
      { id: 3, scenario: 'Forecast2024', version: 'v2', account: 'Revenue', period: '2024-02', amount: 160000, currency: 'USD', uploadDate: '2024-02-01T09:15:00Z' }
    ];
    this.records.set(mockData);
  }
}
