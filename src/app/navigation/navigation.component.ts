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
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
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
