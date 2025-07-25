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
  templateUrl: './records.component.html',
  styleUrl: './records.component.scss'
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
