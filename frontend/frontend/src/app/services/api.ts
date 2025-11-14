import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  api = axios.create({
    baseURL: 'http://localhost:5000',
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
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
    return this.api.post('/api/products/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  jobStatus(id: string) { return this.api.get(`/api/jobs/${id}`); }

  report(params: any) {
    return this.api.get('/api/products/report', {
      params,
      responseType: 'blob'
    });
  }
}