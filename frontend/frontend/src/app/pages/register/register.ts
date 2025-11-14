import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  email = '';
  password = '';
  error = '';
  success = '';

  constructor(private api: ApiService, private router: Router) {}

  async submit() {
    this.error = '';
    try {
      await this.api.register({ email: this.email, password: this.password });
      this.success = 'Registered — please login';
      setTimeout(() => this.router.navigate(['/login']), 900);
    } catch (err: any) {
      this.error = err?.response?.data?.message || 'Registration failed';
    }
  }
}
