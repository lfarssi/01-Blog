import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { publicGuard } from './guards/public-guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    loadChildren: () => import('./layouts/auth-layout/app.routes').then((m) => m.routes),
    canActivateChild: [publicGuard],
  },
   {
    path: '',
    loadComponent: () => import('./layouts/home-layout/home-layout').then((m) => m.HomeLayout),
    loadChildren: () => import('./layouts/home-layout/app.routes').then((m) => m.routes),
    canActivateChild: [publicGuard],
  },

  { path: '**', redirectTo: 'login' },
];
