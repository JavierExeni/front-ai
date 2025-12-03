import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: 'login',
    loadComponent: () => import('./auth/pages/login/login').then((m) => m.Login),
  },
  // {
  //   path: 'register',
  //   loadComponent: () =>
  //     import('./presentation/auth/register/register').then((m) => m.Register),
  // },
  {
    path: 'company',
    loadChildren: () => import('./layouts/admin-layout/admin.routes')
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found').then((m) => m.NotFound),
  },
];
