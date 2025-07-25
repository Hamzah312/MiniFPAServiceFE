import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <mat-icon class="toolbar-icon">account_balance</mat-icon>
      <span class="app-title">Financial Planning Assistant</span>
    </mat-toolbar>

    <nav mat-tab-nav-bar class="navigation-tabs">
      <a mat-tab-link
         *ngFor="let link of navLinks"
         [routerLink]="link.path"
         routerLinkActive
         #rla="routerLinkActive"
         [active]="rla.isActive">
        <mat-icon>{{ link.icon }}</mat-icon>
        {{ link.label }}
      </a>
    </nav>

    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .toolbar-icon {
      margin-right: 12px;
    }

    .app-title {
      font-size: 20px;
      font-weight: 500;
    }

    .navigation-tabs {
      background-color: #424242;
      border-bottom: 1px solid #666;
    }

    .navigation-tabs a {
      min-width: 120px;
      color: #ffffff;
    }

    .navigation-tabs a mat-icon {
      margin-right: 8px;
      font-size: 20px;
      height: 20px;
      width: 20px;
    }

    .main-content {
      padding: 24px;
      min-height: calc(100vh - 112px);
    }
  `]
})
export class NavigationComponent {
  navLinks = [
    { path: '/upload', label: 'Upload', icon: 'upload_file' },
    { path: '/records', label: 'Records', icon: 'table_view' },
    { path: '/scenarios', label: 'Scenarios', icon: 'scenario' },
    { path: '/report', label: 'Reports', icon: 'assessment' },
    { path: '/lookup', label: 'Lookup', icon: 'search' }
  ];
}
