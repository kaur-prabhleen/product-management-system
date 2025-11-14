import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.html'
})
export class ProductsComponent implements OnInit {
  data: any[] = [];
  page = 1; limit = 10; pages = 0; total = 0;
  search = ''; sort = 'price_asc'; category = '';

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  async load() {
    try {
      const res = await this.api.listProducts({ page: this.page, limit: this.limit, search: this.search, sort: this.sort, category: this.category });
      this.data = res.data.data;
      this.total = res.data.total;
      this.pages = res.data.pages;
    } catch (e) { console.error(e); }
  }
  next() { if (this.page < this.pages) { this.page++; this.load(); } }
  prev() { if (this.page > 1) { this.page--; this.load(); } }
}
