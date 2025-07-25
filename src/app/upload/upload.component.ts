import { Component, signal } from '@angular/core';
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  uploadForm: FormGroup;
  selectedFile = signal<File | null>(null);
  isLoading = signal(false);
  uploadProgress = signal(0);
  message = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.uploadForm = this.fb.group({
      scenario: ['', [Validators.required]],
      version: ['', [Validators.required]],
      userName: ['', [Validators.required]]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.selectedFile.set(file);
      this.message.set(null);
    } else {
      this.selectedFile.set(null);
      this.message.set({ text: 'Please select a valid Excel (.xlsx) file', type: 'error' });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const container = event.target as HTMLElement;
    container.classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const container = event.target as HTMLElement;
    container.classList.remove('dragover');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const container = event.target as HTMLElement;
    container.classList.remove('dragover');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        this.selectedFile.set(file);
        this.message.set(null);
      } else {
        this.selectedFile.set(null);
        this.message.set({ text: 'Please select a valid Excel (.xlsx) file', type: 'error' });
      }
    }
  }

  onSubmit(): void {
    if (this.uploadForm.valid && this.selectedFile()) {
      this.isLoading.set(true);
      this.uploadProgress.set(0);
      this.message.set(null);

      const { scenario, version, userName } = this.uploadForm.value;
      const formData = new FormData();
      formData.append('file', this.selectedFile()!);
      formData.append('scenario', scenario);
      formData.append('version', version);
      formData.append('userName', userName);

// Remove query parameters
      this.http.post(`http://localhost:5210/api/finance/upload`, formData, {
        reportProgress: true,
        observe: 'events'
      })

      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = Math.round(100 * event.loaded / (event.total || 1));
            this.uploadProgress.set(progress);
          } else if (event instanceof HttpResponse) {
            this.message.set({ text: 'File uploaded successfully!', type: 'success' });
            this.uploadForm.reset();
            this.selectedFile.set(null);
            this.uploadProgress.set(0);
          }
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.message.set({
            text: error.error?.message || 'Upload failed. Please try again.',
            type: 'error'
          });
          this.uploadProgress.set(0);
        }
      });
    } else {
      this.message.set({ text: 'Please fill all fields and select a file', type: 'error' });
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }
}
