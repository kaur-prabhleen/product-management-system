import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { CategoriesComponent } from './pages/categories/categories';
import { ProductsComponent } from './pages/products/products';
import { ProductFormComponent } from './pages/product-form/product-form';
import { BulkUploadComponent } from './pages/bulk-upload/bulk-upload';
import { ReportsComponent } from './pages/reports/reports';
import { AuthGuard } from '././services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  { path: 'products', component: ProductsComponent },
  { path: 'products/create', component: ProductFormComponent, canActivate: [AuthGuard] },
  
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'bulk-upload', component: BulkUploadComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'products' }
];
