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
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
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
