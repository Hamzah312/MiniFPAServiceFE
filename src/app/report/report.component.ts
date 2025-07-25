import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

interface ReportSummary {
  scenario: string;
  version: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  recordCount: number;
  lastUpdated: string;
  topAccounts: {
    account: string;
    amount: number;
    percentage: number;
  }[];
  monthlyBreakdown: {
    period: string;
    revenue: number;
    expenses: number;
    netIncome: number;
  }[];
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <mat-card class="filter-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>assessment</mat-icon>
          Generate Report
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="reportForm" (ngSubmit)="generateReport()" class="report-form">
          <mat-form-field appearance="outline">
            <mat-label>Scenario</mat-label>
            <input matInput formControlName="scenario" placeholder="Enter scenario name">
            <mat-error *ngIf="reportForm.get('scenario')?.hasError('required')">
              Scenario is required
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline">
            <mat-label>Version (Optional)</mat-label>
            <input matInput formControlName="version" placeholder="Enter version">
          </mat-form-field>
          
          <button mat-raised-button color="primary" type="submit" [disabled]="!reportForm.valid || isLoading()">
            <mat-icon>play_arrow</mat-icon>
            Generate Report
          </button>
        </form>
      </mat-card-content>
    </mat-card>

    <div *ngIf="isLoading()" class="loading-container">
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
      <p>Generating report...</p>
    </div>

    <div *ngIf="reportData() && !isLoading()" class="report-container">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card revenue">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>trending_up</mat-icon>
              <span>Total Revenue</span>
            </div>
            <div class="amount">{{ reportData()!.totalRevenue | currency }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card expenses">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>trending_down</mat-icon>
              <span>Total Expenses</span>
            </div>
            <div class="amount">{{ reportData()!.totalExpenses | currency }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card net-income" [class.positive]="reportData()!.netIncome > 0" [class.negative]="reportData()!.netIncome < 0">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>account_balance</mat-icon>
              <span>Net Income</span>
            </div>
            <div class="amount">{{ reportData()!.netIncome | currency }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card records">
          <mat-card-content>
            <div class="card-header">
              <mat-icon>receipt</mat-icon>
              <span>Records</span>
            </div>
            <div class="amount">{{ reportData()!.recordCount | number }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Top Accounts -->
      <mat-card class="details-card">
        <mat-card-header>
          <mat-card-title>Top Accounts by Amount</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="account-list">
            <div *ngFor="let account of reportData()!.topAccounts" class="account-item">
              <div class="account-info">
                <span class="account-name">{{ account.account }}</span>
                <span class="account-amount">{{ account.amount | currency }}</span>
              </div>
              <div class="account-percentage">{{ account.percentage }}%</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Monthly Breakdown -->
      <mat-card class="details-card">
        <mat-card-header>
          <mat-card-title>Monthly Breakdown</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="monthly-list">
            <div *ngFor="let month of reportData()!.monthlyBreakdown" class="month-item">
              <div class="month-header">{{ month.period }}</div>
              <div class="month-details">
                <div class="detail-item">
                  <span>Revenue:</span>
                  <span class="revenue">{{ month.revenue | currency }}</span>
                </div>
                <div class="detail-item">
                  <span>Expenses:</span>
                  <span class="expenses">{{ month.expenses | currency }}</span>
                </div>
                <div class="detail-item">
                  <span>Net Income:</span>
                  <span class="net" [class.positive]="month.netIncome > 0" [class.negative]="month.netIncome < 0">
                    {{ month.netIncome | currency }}
                  </span>
                </div>
              </div>
              <mat-divider></mat-divider>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Report Info -->
      <mat-card class="info-card">
        <mat-card-content>
          <p><strong>Scenario:</strong> {{ reportData()!.scenario }}</p>
          <p><strong>Version:</strong> {{ reportData()!.version }}</p>
          <p><strong>Last Updated:</strong> {{ reportData()!.lastUpdated | date:'full' }}</p>
        </mat-card-content>
      </mat-card>
    </div>

    <div *ngIf="!reportData() && !isLoading()" class="no-data">
      <mat-icon>assessment</mat-icon>
      <p>Enter a scenario name above to generate a summary report.</p>
    </div>
  `,
  styles: [`
    .filter-card {
      margin-bottom: 24px;
    }

    .report-form {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .report-form mat-form-field {
      min-width: 200px;
    }

    .loading-container {
      text-align: center;
      padding: 24px;
    }

    .report-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .summary-card {
      min-height: 120px;
    }

    .summary-card.revenue {
      border-left: 4px solid #4caf50;
    }

    .summary-card.expenses {
      border-left: 4px solid #f44336;
    }

    .summary-card.net-income.positive {
      border-left: 4px solid #4caf50;
    }

    .summary-card.net-income.negative {
      border-left: 4px solid #f44336;
    }

    .summary-card.records {
      border-left: 4px solid #2196f3;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      color: #666;
      font-size: 14px;
    }

    .amount {
      font-size: 24px;
      font-weight: 600;
    }

    .details-card {
      margin-bottom: 16px;
    }

    .account-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .account-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .account-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .account-name {
      font-weight: 500;
    }

    .account-amount {
      color: #666;
      font-size: 14px;
    }

    .account-percentage {
      font-weight: 600;
      color: #2196f3;
    }

    .monthly-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .month-item {
      padding-bottom: 16px;
    }

    .month-header {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 12px;
    }

    .month-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 8px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .revenue {
      color: #4caf50;
      font-weight: 500;
    }

    .expenses {
      color: #f44336;
      font-weight: 500;
    }

    .net.positive {
      color: #4caf50;
      font-weight: 600;
    }

    .net.negative {
      color: #f44336;
      font-weight: 600;
    }

    .info-card {
      background-color: rgba(255, 255, 255, 0.05);
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
export class ReportComponent {
  reportForm: FormGroup;
  reportData = signal<ReportSummary | null>(null);
  isLoading = signal(false);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.reportForm = this.fb.group({
      scenario: ['', Validators.required],
      version: ['']
    });
  }

  generateReport() {
    if (!this.reportForm.valid) return;

    this.isLoading.set(true);
    const { scenario, version } = this.reportForm.value;
    
    let url = `/api/Reports/summary?scenario=${scenario}`;
    if (version) {
      url += `&version=${version}`;
    }

    this.http.get<ReportSummary>(url)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.reportData.set(data);
          this.snackBar.open('Report generated successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error generating report:', error);
          this.snackBar.open('Failed to generate report', 'Close', { duration: 3000 });
          // Show mock data for demo purposes
          this.showMockData(scenario, version || 'v1');
        }
      });
  }

  private showMockData(scenario: string, version: string) {
    const mockData: ReportSummary = {
      scenario,
      version,
      totalRevenue: 2500000,
      totalExpenses: -1800000,
      netIncome: 700000,
      recordCount: 1250,
      lastUpdated: new Date().toISOString(),
      topAccounts: [
        { account: 'Sales Revenue', amount: 1500000, percentage: 60 },
        { account: 'Service Revenue', amount: 1000000, percentage: 40 },
        { account: 'Marketing Expenses', amount: -800000, percentage: 44.4 },
        { account: 'Operations Expenses', amount: -600000, percentage: 33.3 },
        { account: 'Administrative Expenses', amount: -400000, percentage: 22.2 }
      ],
      monthlyBreakdown: [
        { period: '2024-01', revenue: 800000, expenses: -600000, netIncome: 200000 },
        { period: '2024-02', revenue: 850000, expenses: -580000, netIncome: 270000 },
        { period: '2024-03', revenue: 850000, expenses: -620000, netIncome: 230000 }
      ]
    };
    this.reportData.set(mockData);
  }
}
