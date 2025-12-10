import { Routes } from "@angular/router";
import { AdminLayout } from "./admin-layout";


export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('../../features/dashboard/dashboard')
      },
      {
        path: 'contacts',
        loadComponent: () => import('../../features/contacts/contacts')
      },
      {
        path: 'profile',
        loadComponent: () => import('../../features/profile-account/profile-account')
      },
       {
        path: '**',
        redirectTo: 'dashboard',
      },
    ]
  }
]

export default adminRoutes;
