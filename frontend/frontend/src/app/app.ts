// src/app/app.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [
    RouterModule,
    CommonModule
  ]
})
export class App {
  isLoggedIn() {
    return !!localStorage.getItem('jwt');
  }

  logout() {
    localStorage.removeItem('jwt');
    window.location.href = '/login';
  }
}
