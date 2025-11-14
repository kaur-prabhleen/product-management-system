import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-bulk-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-upload.html'
})
export class BulkUploadComponent {
  file: File | null = null;
  jobId = '';
  status = '';
  logs: string[] = [];

  constructor(private api: ApiService) {}

  onFile(e: any) {
    this.file = e.target.files[0] ?? null;
  }

  async upload() {
    if (!this.file) return alert('Choose a CSV file first');
    const fd = new FormData();
    fd.append('file', this.file);
    try {
      const res = await this.api.bulkUpload(fd);
      // backend should return an id or externalId or jobId
      this.jobId = res.data.jobId || res.data.externalId || res.data.id || '';
      this.status = 'queued';
      this.logs.push(`Uploaded -> jobId=${this.jobId}`);
      if (this.jobId) this.pollStatus();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Upload failed');
    }
  }

  async pollStatus() {
    if (!this.jobId) return;
    const check = async () => {
      try {
        const r = await this.api.jobStatus(this.jobId);
        this.status = r.data.status || r.data.state || 'unknown';
        if (r.data?.meta?.logs && Array.isArray(r.data.meta.logs)) {
          this.logs = r.data.meta.logs.concat(this.logs).slice(0, 50);
        }
        if (this.status === 'completed' || this.status === 'failed') {
          this.logs.push(`Job ${this.jobId} ${this.status}`);
          return;
        }
        setTimeout(check, 2000);
      } catch (e) {
        console.error(e);
        setTimeout(check, 3000);
      }
    };
    check();
  }
}
