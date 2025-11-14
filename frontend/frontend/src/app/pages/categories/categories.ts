import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-categories',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categories.html'
})
export class CategoriesComponent implements OnInit {
  categories: any[] = [];
  name = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  async load() {
    try {
      const res = await this.api.listCategories();
      this.categories = res.data.data || res.data;
    } catch (e) { this.error = 'Failed to load categories'; }
  }

  async create() {
    try {
      await this.api.createCategory({ name: this.name });
      this.name = '';
      await this.load();
    } catch (e: any) { this.error = e?.response?.data?.message || 'Create failed'; }
  }

  async remove(c: any) {
    if (!confirm('Delete category?')) return;
    await this.api.deleteCategory(c.uuid);
    await this.load();
  }
}
