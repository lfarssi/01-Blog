import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { authGuard } from './guards/auth-guard';
import { publicGuard } from './guards/public-guard';

export const routes: Routes = [
  // Home: only if logged in
  { path: 'home', component: Home, canActivate: [publicGuard] },

  // Login: only if NOT logged in
  { path: 'login', component: Login, canActivate: [publicGuard] },

  // Register: only if NOT logged in
  { path: 'register', component: Register, canActivate: [publicGuard] },

  // Redirect root to login (or home if logged in)
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Optional: wildcard route
  { path: '**', redirectTo: 'login' }
];
