import { Injectable } from '@angular/core';
import axios, { AxiosInstance } from 'axios';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseURL: string;
  api: AxiosInstance;

  constructor() {
    this.baseURL = environment.apiBaseUrl || 'http://localhost:5000';
    this.api = axios.create({
      baseURL: this.baseURL,
      withCredentials: false,
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt');
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (err) => Promise.reject(err));
  }

  register(data: any) { return this.api.post('/api/auth/register', data); }
  login(data: any) { return this.api.post('/api/auth/login', data); }

  listCategories() { return this.api.get('/api/categories'); }
  createCategory(data: any) { return this.api.post('/api/categories', data); }
  deleteCategory(uuid: string) { return this.api.delete(`/api/categories/${uuid}`); }

  listProducts(params: any) { return this.api.get('/api/products', { params }); }
  createProduct(formData: FormData) {
    return this.api.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  bulkUpload(formData: FormData) {
    return this.api.post('/api/bulk/upload', formData, { 
      headers: {'Content-Type':'multipart/form-data'},
      timeout: 30000 
    }).catch(error => {
      console.error('Bulk upload error details:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response?.data
      });
      throw error;
    });
  }

  jobStatus(id: string) {
    return this.api.get(`/api/bulk/status/${id}`);
  }

  report(params: any) {
    return this.api.get('/api/products/report', {
      params,
      responseType: 'blob'
    });
  }

  listUploads() {
    return this.api.get('/api/reports/uploads');
  }

  downloadUploadUrl(jobId: string) {
    return `${this.baseURL}/api/reports/uploads/${jobId}/download`;
  }

  exportProductsUrl(format = 'csv', opts: Record<string,string|number|undefined> = {}) {
    const q = new URLSearchParams({ format, ...Object.fromEntries(Object.entries(opts).filter(([k,v])=>v!=null)) }).toString();
    return `${this.baseURL}/api/reports/products?${q}`;
  }

downloadProductsBlob(format: 'csv'|'xlsx' = 'csv', opts: Record<string, string|number|undefined> = {}) {
  const params = { format, ...Object.fromEntries(Object.entries(opts).filter(([k,v])=>v!=null)) };

  const options: any = {
    params,
    responseType: 'blob' as const,
  };


  return this.api.get('/api/reports/products', options)
    .then(async resp => {
      const contentType = (resp.headers && (resp.headers['content-type'] || resp.headers['Content-Type'])) || '';

      if (contentType.includes('application/json') || contentType.includes('text/html')) {
        try {
          const text = await resp.data.text();
          try {
            const json = JSON.parse(text);
            throw new Error(json.message || JSON.stringify(json));
          } catch {
            throw new Error(text || 'Server returned an error');
          }
        } catch (err: any) {
          return Promise.reject(err instanceof Error ? err : new Error(String(err)));
        }
      }

      return resp;
    })
    .catch(err => {
      console.error('downloadProductsBlob error', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        headers: err.response?.headers,
      });
      throw err;
    });
}

}