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
        path: 'outbound/list',
        loadComponent: () => import('../../features/outbound/outbound-list/outbound-list')
      },
      {
        path: 'outbound/create',
        loadComponent: () => import('../../features/outbound/outbound-create/outbound-create')
      },
      {
        path: 'profile',
        loadComponent: () => import('../../features/profile-account/profile-account')
      },
      {
        path: 'subscription-plans',
        loadComponent: () => import('../../features/subcription-plans/subcription-plans')
      },
      {
        path: 'voice-agents',
        loadComponent: () => import('../../features/voice-agents/voice-agents')
      },
       {
        path: '**',
        redirectTo: 'dashboard',
      },
    ]
  }
]

export default adminRoutes;
