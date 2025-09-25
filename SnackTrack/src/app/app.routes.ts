import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { TabsPage } from './pages/tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'kitchen',
        loadComponent: () =>
          import('./pages/inventory/inventory.page').then(
            (m) => m.InventoryPage
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'administration',
        loadComponent: () =>
          import('./pages/administration/administration.page').then(
            (m) => m.AdministrationPage
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/account/account.page').then((m) => m.AccountPage),
        canActivate: [AuthGuard],
      },
      {
        path: '',
        redirectTo: '/tabs/dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
];
