import { Routes } from '@angular/router';
import { TabsPage } from './pages/tabs/tabs.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    component: TabsPage, // TabsPage ist das Container-Layout
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          ),
      },
      {
        path: 'kitchen',
        loadComponent: () =>
          import('./pages/inventory/inventory.page').then(
            (m) => m.InventoryPage
          ),
      },
      {
        path: 'list',
        loadComponent: () =>
          import('./pages/add-item/add-item.page').then((m) => m.AddItemPage),
      },
      {
        path: 'recipes',
        loadComponent: () =>
          import('./pages/item-detail/item-detail.page').then(
            (m) => m.ItemDetailPage
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/account/account.page').then((m) => m.AccountPage),
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
  },  {
    path: 'administration',
    loadComponent: () => import('./pages/administration/administration.page').then( m => m.AdministrationPage)
  },

];
