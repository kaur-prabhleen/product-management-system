// src/app/app.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [RouterModule]
})
export class App {
  // used in the template
  isLoggedIn() {
    return !!localStorage.getItem('jwt');
  }

  // simple logout: remove token and navigate to login
  logout() {
    localStorage.removeItem('jwt');
    // navigate to login — using location instead of Router avoids injector complexity
    window.location.href = '/login';
  }
}
