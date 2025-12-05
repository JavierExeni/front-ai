import { Routes } from "@angular/router";
import { AuthLayout } from "./auth-layout";


export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () => import('../../auth/pages/login/login')
      },
      {
        path: 'register',
        loadComponent: () => import('../../auth/pages/register/register')
      },
       {
        path: '**',
        redirectTo: 'login',
      },
    ]
  }
]

export default authRoutes;
