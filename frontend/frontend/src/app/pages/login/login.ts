import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  async submit() {
    this.error = '';
    try {
      const res = await this.api.login({ email: this.email, password: this.password });
      const token = res.data.token;
      localStorage.setItem('jwt', token);
      this.router.navigate(['/products']);
    } catch (err: any) {
      this.error = err?.response?.data?.message || 'Login failed';
    }
  }
}
