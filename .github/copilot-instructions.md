# Copilot Instructions for FPA Frontend

## Project Overview

This is a modern Angular (v20+) application designed for financial planning and analysis. The project is named `fpa-frontend` and provides a comprehensive Material Design interface for managing financial data. The entry point is [`src/main.ts`](src/main.ts), which bootstraps the root component [`App`](src/app/app.ts) using configuration from [`appConfig`](src/app/app.config.ts).

## Architecture & Patterns

- **Standalone Components**: All components use Angular's standalone architecture (no modules)
- **Angular Material**: Uses Material Design with a dark theme configured in [`src/styles.scss`](src/styles.scss)
- **Reactive Forms**: Form handling uses Angular Reactive Forms with validation
- **Signals**: State management uses Angular signals (e.g., `selectedFile = signal<File | null>(null)`)
- **HTTP Client**: API communication uses Angular's HttpClient
- **Navigation**: Tab-based navigation using Material tabs and Angular router
- **Mock Data**: Components show mock data when API calls fail for demo purposes

## Application Structure

- **NavigationComponent** ([`src/app/navigation/navigation.component.ts`](src/app/navigation/navigation.component.ts)): Main layout with toolbar and tab navigation
- **UploadComponent** ([`src/app/upload/upload.component.ts`](src/app/upload/upload.component.ts)): Excel file upload with drag-and-drop
- **RecordsComponent** ([`src/app/records/records.component.ts`](src/app/records/records.component.ts)): View and filter financial records with Material table
- **ScenariosComponent** ([`src/app/scenarios/scenarios.component.ts`](src/app/scenarios/scenarios.component.ts)): Manage scenarios with clone functionality and dialogs
- **ReportComponent** ([`src/app/report/report.component.ts`](src/app/report/report.component.ts)): Generate summary reports with charts and metrics
- **LookupComponent** ([`src/app/lookup/lookup.component.ts`](src/app/lookup/lookup.component.ts)): Account mappings and FX rates in tabbed interface

## API Endpoints

- **Upload**: `POST /api/finance/upload` - Upload Excel files with form data
- **Records**: `GET /api/Records?scenario=...&version=...` - Fetch financial records
- **Scenarios**: `GET /api/Scenarios`, `POST /api/Scenarios/clone` - Manage scenarios
- **Reports**: `GET /api/Reports/summary?scenario=...` - Generate summary reports
- **Lookup**: `GET /api/Lookup/account-mapping`, `GET /api/Lookup/fx-rates` - Reference data

## Developer Workflows

- **Development Server**: `npm start` serves at http://localhost:4200 with proxy to backend
- **Build**: `npm run build` - outputs to `dist/`
- **Testing**: `npm test` - runs unit tests with Karma
- **Proxy Configuration**: [`proxy.conf.json`](proxy.conf.json) forwards `/api` requests to `http://localhost:5210`

## Styling & Theme

- **Dark Theme**: Configured using Angular Material's Material 3 dark theme
- **SCSS**: All stylesheets use SCSS syntax
- **Material Components**: Uses mat-card, mat-table, mat-tabs, mat-toolbar, mat-dialog, mat-snackbar
- **Responsive Design**: Mobile-friendly layout with flexbox and CSS Grid
- **Custom Styling**: Color-coded elements (revenue/expense, status badges, currency codes)

## Common Patterns

- **Form Validation**: Angular's built-in validators with Material error display
- **File Upload**: Drag-and-drop with progress tracking and file type validation
- **Data Tables**: Material tables with sorting and responsive design
- **Loading States**: Progress bars and loading indicators
- **Error Handling**: MatSnackBar for user notifications
- **Modals**: Material dialogs for actions like cloning scenarios
- **Mock Data**: Fallback data for demo when APIs are unavailable

## Navigation Structure

```
/ (NavigationComponent)
├── /upload (UploadComponent)
├── /records (RecordsComponent)
├── /scenarios (ScenariosComponent)  
├── /report (ReportComponent)
└── /lookup (LookupComponent)
```

## Key Features

- **File Upload**: Excel (.xlsx) upload with metadata (scenario, version, username)
- **Data Views**: Filterable tables for records with search capabilities
- **Scenario Management**: Clone scenarios with custom naming
- **Financial Reports**: Summary metrics with visual indicators
- **Reference Data**: Account mappings and foreign exchange rates
- **Real-time Feedback**: Progress indicators and success/error messages
