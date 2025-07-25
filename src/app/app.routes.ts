import { Routes } from '@angular/router';
import { NavigationComponent } from './navigation/navigation.component';
import { UploadComponent } from './upload/upload.component';
import { RecordsComponent } from './records/records.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { ReportComponent } from './report/report.component';
import { LookupComponent } from './lookup/lookup.component';

export const routes: Routes = [
  {
    path: '',
    component: NavigationComponent,
    children: [
      { path: '', redirectTo: '/upload', pathMatch: 'full' },
      { path: 'upload', component: UploadComponent },
      { path: 'records', component: RecordsComponent },
      { path: 'scenarios', component: ScenariosComponent },
      { path: 'report', component: ReportComponent },
      { path: 'lookup', component: LookupComponent }
    ]
  },
  { path: '**', redirectTo: '/upload' }
];
