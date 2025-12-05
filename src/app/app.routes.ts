import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./layouts/auth-layout/auth.routes'),
  },
  {
    path: 'company',
    loadChildren: () => import('./layouts/admin-layout/admin.routes'),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () => import('./shared/pages/not-found/not-found').then((m) => m.NotFound),
  },
];
