# Copilot Instructions for FPA Frontend

## Project Overview

This is a modern Angular (v20+) application designed for financial record uploads. The project is named `fpa-frontend` and provides a clean, Material Design interface for uploading Excel files with metadata. The entry point is [`src/main.ts`](src/main.ts), which bootstraps the root component [`App`](src/app/app.ts) using configuration from [`appConfig`](src/app/app.config.ts).

## Architecture & Patterns

- **Standalone Components**: All components use Angular's standalone architecture (no modules)
- **Angular Material**: Uses Material Design with a dark theme configured in [`src/styles.scss`](src/styles.scss)
- **Reactive Forms**: Form handling uses Angular Reactive Forms with validation
- **Signals**: State management uses Angular signals (e.g., `selectedFile = signal<File | null>(null)`)
- **HTTP Client**: File uploads use Angular's HttpClient with multipart/form-data
- **Routing**: Single route `/upload` configured in [`src/app/app.routes.ts`](src/app/app.routes.ts) with default redirect

## Key Components

- **UploadComponent** ([`src/app/upload/upload.component.ts`](src/app/upload/upload.component.ts)): Main component for Excel file uploads
  - Three text inputs: Scenario, Version, UserName (all required)
  - File input accepting only .xlsx files
  - Drag-and-drop functionality
  - Progress bar for upload status
  - Success/error message display

## Developer Workflows

- **Development Server**: `npm start` serves at http://localhost:4200 with proxy to backend
- **Build**: `npm run build` - outputs to `dist/`
- **Testing**: `npm test` - runs unit tests with Karma
- **Proxy Configuration**: [`proxy.conf.json`](proxy.conf.json) forwards `/api` requests to `http://localhost:5000`

## Styling & Theme

- **Dark Theme**: Configured using Angular Material's dark theme
- **SCSS**: All stylesheets use SCSS syntax
- **Material Components**: Uses mat-card, mat-form-field, mat-button, mat-progress-bar, mat-icon
- **Responsive Design**: Mobile-friendly layout with flexbox

## API Integration

- **Endpoint**: `POST /api/FinancialRecords/upload`
- **Method**: Multipart form data with file in body
- **Query Parameters**: `scenario`, `version`, `userName`
- **Progress Tracking**: Real-time upload progress using HttpClient's progress events

## File Structure Patterns

- Components follow Angular CLI conventions: `.ts`, `.html`, `.scss` files
- Standalone components with explicit imports
- Routing configured at app level
- Global styles in [`src/styles.scss`](src/styles.scss)
- Component-specific styles in respective `.scss` files

## Configuration Files

- [`angular.json`](angular.json): Build configuration with SCSS support and proxy config
- [`proxy.conf.json`](proxy.conf.json): Development proxy to backend API
- [`package.json`](package.json): Includes Angular Material and animations dependencies

## Common Patterns

- Form validation using Angular's built-in validators
- File type validation for .xlsx files only
- Error handling with user-friendly messages
- Loading states with Material progress bars
- Drag-and-drop file upload with visual feedback
