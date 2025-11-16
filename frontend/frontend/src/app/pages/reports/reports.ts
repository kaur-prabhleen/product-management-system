import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  selector: 'app-reports',
  imports: [CommonModule],
  templateUrl: './reports.html',
})
export class ReportsComponent implements OnInit {
  uploads: Array<any> = [];
  loading = false;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadUploads();
  }

  async loadUploads() {
    this.loading = true;
    this.error = null;
    try {
      const res = await this.api.listUploads();
      this.uploads = res?.data ?? [];
    } catch (err: any) {
      console.error('listUploads error', err);
      this.error = err?.response?.data?.message || err?.message || 'Failed to load uploads';
    } finally {
      this.loading = false;
    }
  }

  async downloadUpload(jobId: string, filename?: string) {
    try {
      const url = this.api.downloadUploadUrl(jobId);
      const token = localStorage.getItem('jwt');
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const txt = await res.text().catch(()=>null);
        throw new Error(`Download failed: ${res.status} ${res.statusText} ${txt ? '- ' + txt : ''}`);
      }
      const blob = await res.blob();
      const name = filename || `upload_${jobId}.csv`;
      this.saveBlob(blob, name);
    } catch (e: any) {
      console.error('downloadUpload error', e);
      alert(e?.message || 'Download failed');
    }
  }

  async exportProducts(format: 'csv' | 'xlsx' = 'csv') {
    try {
      const res = await this.api.downloadProductsBlob(format);
      const blob = res.data;
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      this.saveBlob(blob, `products_${Date.now()}.${ext}`);
    } catch (e: any) {
      console.error('exportProducts error', e);
      const msg = e?.response?.data
        ? (typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data))
        : e?.message || 'Export failed';
      alert(`Export failed: ${msg}`);
    }
  }


  async viewJob(jobId: string) {
    try {
      const res = await this.api.jobStatus(jobId);
      const data = res.data;
  
      const w = window.open('', '_blank');
      if (!w) {
        alert('Popup blocked — please allow popups to view job details.');
        return;
      }
  
      w.document.title = `Job ${jobId}`;
      w.document.body.style.whiteSpace = 'pre';
      w.document.body.style.fontFamily = 'monospace';
      w.document.body.textContent = JSON.stringify(data, null, 2);
  
    } catch (err: any) {
      console.error('viewJob error:', err);
      alert(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to fetch job details'
      );
    }
  }  

  private saveBlob(blob: Blob, filename: string) {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);
  }
}
