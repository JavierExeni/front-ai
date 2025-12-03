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
        path: '**',
        redirectTo: 'dashboard',
      },
    ]
  }
]

export default adminRoutes;
