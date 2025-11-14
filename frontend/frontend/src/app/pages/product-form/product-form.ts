import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.html'
})
export class ProductFormComponent implements OnInit {
  name = ''; price = ''; category_uuid = ''; imageFile: File | null = null;
  categories: any[] = [];
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() { this.loadCategories(); }

  onFile(e: any) { this.imageFile = e.target.files[0]; }

  async loadCategories() {
    try {
      const res = await this.api.listCategories();
      this.categories = res.data.data || res.data;
    } catch (e) { console.error(e); }
  }

  async submit() {
    try {
      const fd = new FormData();
      fd.append('name', this.name);
      fd.append('price', this.price);
      fd.append('category_uuid', this.category_uuid);
      if (this.imageFile) fd.append('image', this.imageFile);
      await this.api.createProduct(fd);
      this.router.navigate(['/products']);
    } catch (err: any) {
      this.error = err?.response?.data?.message || 'Create failed';
    }
  }
}
