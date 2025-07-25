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
  template: `
    <mat-card class="lookup-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>search</mat-icon>
          Lookup Data
        </mat-card-title>
        <mat-card-subtitle>Account mappings and foreign exchange rates</mat-card-subtitle>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="refreshData()" [disabled]="isLoading()">
            <mat-icon>refresh</mat-icon>
            Refresh All
          </button>
        </div>
      </mat-card-header>

      <mat-progress-bar *ngIf="isLoading()" mode="indeterminate"></mat-progress-bar>

      <mat-card-content>
        <mat-tab-group>
          <!-- Account Mapping Tab -->
          <mat-tab label="Account Mapping">
            <ng-template matTabContent>
              <div class="tab-content">
                <div class="tab-header">
                  <h3>Account Mapping Rules</h3>
                  <button mat-button color="primary" (click)="loadAccountMappings()" [disabled]="isLoading()">
                    <mat-icon>refresh</mat-icon>
                    Refresh
                  </button>
                </div>

                <div class="table-container" *ngIf="accountMappings().length > 0">
                  <table mat-table [dataSource]="accountMappings()" class="lookup-table">
                    <ng-container matColumnDef="sourceAccount">
                      <th mat-header-cell *matHeaderCellDef>Source Account</th>
                      <td mat-cell *matCellDef="let mapping">{{ mapping.sourceAccount }}</td>
                    </ng-container>

                    <ng-container matColumnDef="targetAccount">
                      <th mat-header-cell *matHeaderCellDef>Target Account</th>
                      <td mat-cell *matCellDef="let mapping">{{ mapping.targetAccount }}</td>
                    </ng-container>

                    <ng-container matColumnDef="accountType">
                      <th mat-header-cell *matHeaderCellDef>Type</th>
                      <td mat-cell *matCellDef="let mapping">
                        <span class="account-type" [class]="mapping.accountType.toLowerCase()">
                          {{ mapping.accountType }}
                        </span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="description">
                      <th mat-header-cell *matHeaderCellDef>Description</th>
                      <td mat-cell *matCellDef="let mapping">{{ mapping.description || '-' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="isActive">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let mapping">
                        <span class="status" [class.active]="mapping.isActive" [class.inactive]="!mapping.isActive">
                          {{ mapping.isActive ? 'Active' : 'Inactive' }}
                        </span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="accountColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: accountColumns;"></tr>
                  </table>
                </div>

                <div *ngIf="accountMappings().length === 0 && !isLoading()" class="no-data">
                  <mat-icon>map</mat-icon>
                  <p>No account mappings found.</p>
                </div>
              </div>
            </ng-template>
          </mat-tab>

          <!-- FX Rates Tab -->
          <mat-tab label="FX Rates">
            <ng-template matTabContent>
              <div class="tab-content">
                <div class="tab-header">
                  <h3>Foreign Exchange Rates</h3>
                  <button mat-button color="primary" (click)="loadFXRates()" [disabled]="isLoading()">
                    <mat-icon>refresh</mat-icon>
                    Refresh
                  </button>
                </div>

                <div class="table-container" *ngIf="fxRates().length > 0">
                  <table mat-table [dataSource]="fxRates()" class="lookup-table">
                    <ng-container matColumnDef="fromCurrency">
                      <th mat-header-cell *matHeaderCellDef>From</th>
                      <td mat-cell *matCellDef="let rate">
                        <span class="currency-code">{{ rate.fromCurrency }}</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="toCurrency">
                      <th mat-header-cell *matHeaderCellDef>To</th>
                      <td mat-cell *matCellDef="let rate">
                        <span class="currency-code">{{ rate.toCurrency }}</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="rate">
                      <th mat-header-cell *matHeaderCellDef>Rate</th>
                      <td mat-cell *matCellDef="let rate">
                        <span class="fx-rate">{{ rate.rate | number:'1.4-4' }}</span>
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="effectiveDate">
                      <th mat-header-cell *matHeaderCellDef>Effective Date</th>
                      <td mat-cell *matCellDef="let rate">{{ rate.effectiveDate | date:'short' }}</td>
                    </ng-container>

                    <ng-container matColumnDef="source">
                      <th mat-header-cell *matHeaderCellDef>Source</th>
                      <td mat-cell *matCellDef="let rate">
                        <span class="source-badge">{{ rate.source }}</span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="fxColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: fxColumns;"></tr>
                  </table>
                </div>

                <div *ngIf="fxRates().length === 0 && !isLoading()" class="no-data">
                  <mat-icon>currency_exchange</mat-icon>
                  <p>No FX rates found.</p>
                </div>
              </div>
            </ng-template>
          </mat-tab>
        </mat-tab-group>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .lookup-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-actions {
      margin-left: auto;
    }

    .tab-content {
      padding: 24px 0;
    }

    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .tab-header h3 {
      margin: 0;
      color: #fff;
    }

    .table-container {
      max-height: 500px;
      overflow: auto;
    }

    .lookup-table {
      width: 100%;
    }

    .account-type {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .account-type.revenue {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }

    .account-type.expense {
      background-color: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }

    .account-type.asset {
      background-color: rgba(33, 150, 243, 0.2);
      color: #2196f3;
    }

    .account-type.liability {
      background-color: rgba(255, 152, 0, 0.2);
      color: #ff9800;
    }

    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status.active {
      background-color: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }

    .status.inactive {
      background-color: rgba(158, 158, 158, 0.2);
      color: #9e9e9e;
    }

    .currency-code {
      font-weight: 600;
      font-family: 'Roboto Mono', monospace;
      background-color: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }

    .fx-rate {
      font-weight: 600;
      font-family: 'Roboto Mono', monospace;
      color: #2196f3;
    }

    .source-badge {
      padding: 2px 8px;
      background-color: rgba(156, 39, 176, 0.2);
      color: #9c27b0;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 500;
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
