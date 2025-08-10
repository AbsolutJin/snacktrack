import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'inventory',
    loadComponent: () => import('./pages/inventory/inventory.page').then( m => m.InventoryPage)
  },
  {
    path: 'add-item',
    loadComponent: () => import('./pages/add-item/add-item.page').then( m => m.AddItemPage)
  },
  {
    path: 'item-detail',
    loadComponent: () => import('./pages/item-detail/item-detail.page').then( m => m.ItemDetailPage)
  },
  {
    path: 'account',
    loadComponent: () => import('./pages/account/account.page').then( m => m.AccountPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then( m => m.TabsPage)
  },
];
