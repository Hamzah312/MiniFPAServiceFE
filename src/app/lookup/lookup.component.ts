import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

interface AccountMapping {
  id: number;
  sourceAccount: string;
  targetAccount: string;
  accountType: string;
  description: string;
  isActive: boolean;
}

interface FXRate {
  id: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  source: string;
}

@Component({
  selector: 'app-lookup',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './lookup.component.html',
  styleUrl: './lookup.component.scss'
})
export class LookupComponent implements OnInit {
  accountMappings = signal<AccountMapping[]>([]);
  fxRates = signal<FXRate[]>([]);
  isLoading = signal(false);
  
  accountColumns = ['sourceAccount', 'targetAccount', 'accountType', 'description', 'isActive'];
  fxColumns = ['fromCurrency', 'toCurrency', 'rate', 'effectiveDate', 'source'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.loadAccountMappings();
    this.loadFXRates();
  }

  loadAccountMappings() {
    this.isLoading.set(true);
    
    this.http.get<AccountMapping[]>('/api/Lookup/account-mapping')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.accountMappings.set(data);
          this.snackBar.open(`Loaded ${data.length} account mappings`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error loading account mappings:', error);
          this.snackBar.open('Failed to load account mappings', 'Close', { duration: 3000 });
          // Show mock data for demo purposes
          this.showMockAccountMappings();
        }
      });
  }

  loadFXRates() {
    this.isLoading.set(true);
    
    this.http.get<FXRate[]>('/api/Lookup/fx-rates')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.fxRates.set(data);
          this.snackBar.open(`Loaded ${data.length} FX rates`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error loading FX rates:', error);
          this.snackBar.open('Failed to load FX rates', 'Close', { duration: 3000 });
          // Show mock data for demo purposes
          this.showMockFXRates();
        }
      });
  }

  private showMockAccountMappings() {
    const mockData: AccountMapping[] = [
      { id: 1, sourceAccount: 'SALES_REV', targetAccount: 'Revenue - Sales', accountType: 'Revenue', description: 'Product sales revenue', isActive: true },
      { id: 2, sourceAccount: 'SERV_REV', targetAccount: 'Revenue - Services', accountType: 'Revenue', description: 'Service revenue', isActive: true },
      { id: 3, sourceAccount: 'MKTG_EXP', targetAccount: 'Expenses - Marketing', accountType: 'Expense', description: 'Marketing and advertising costs', isActive: true },
      { id: 4, sourceAccount: 'OPER_EXP', targetAccount: 'Expenses - Operations', accountType: 'Expense', description: 'General operational expenses', isActive: true },
      { id: 5, sourceAccount: 'CASH_ASSET', targetAccount: 'Assets - Cash', accountType: 'Asset', description: 'Cash and cash equivalents', isActive: true },
      { id: 6, sourceAccount: 'OLD_ACCOUNT', targetAccount: 'Legacy Account', accountType: 'Expense', description: 'Deprecated account mapping', isActive: false }
    ];
    this.accountMappings.set(mockData);
  }

  private showMockFXRates() {
    const mockData: FXRate[] = [
      { id: 1, fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.8456, effectiveDate: '2024-07-25T00:00:00Z', source: 'ECB' },
      { id: 2, fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.7834, effectiveDate: '2024-07-25T00:00:00Z', source: 'BOE' },
      { id: 3, fromCurrency: 'USD', toCurrency: 'JPY', rate: 149.2500, effectiveDate: '2024-07-25T00:00:00Z', source: 'BOJ' },
      { id: 4, fromCurrency: 'USD', toCurrency: 'CAD', rate: 1.3456, effectiveDate: '2024-07-25T00:00:00Z', source: 'BOC' },
      { id: 5, fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.1826, effectiveDate: '2024-07-25T00:00:00Z', source: 'ECB' },
      { id: 6, fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.2764, effectiveDate: '2024-07-25T00:00:00Z', source: 'BOE' },
      { id: 7, fromCurrency: 'CAD', toCurrency: 'USD', rate: 0.7432, effectiveDate: '2024-07-25T00:00:00Z', source: 'BOC' }
    ];
    this.fxRates.set(mockData);
  }
}
