import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./landing-page/landing-page.component').then((m) => m.LandingPageComponent),
      },
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        redirectTo: 'login',
        pathMatch: 'full'
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/client-home/client-home.component').then(
            (m) => m.ClientHomeComponent,
          ),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./dashboard/accounts/accounts-list/accounts-list.component').then(
            (m) => m.AccountsListComponent,
          ),
      },
      {
        path: 'accounts/new',
        loadComponent: () =>
          import('./dashboard/accounts/new-account/new-account.component').then(
            (m) => m.NewAccountComponent,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./dashboard/transactions/history/history.component').then(
            (m) => m.TransactionsHistoryComponent,
          ),
      },
      {
        path: 'transactions/transfer',
        loadComponent: () =>
          import('./dashboard/transactions/transfer/transfer.component').then(
            (m) => m.TransferComponent,
          ),
      },
      {
        path: 'transactions/deposit',
        loadComponent: () =>
          import('./dashboard/transactions/deposit/deposit.component').then(
            (m) => m.DepositComponent,
          ),
      },
      {
        path: 'transactions/withdrawal',
        loadComponent: () =>
          import('./dashboard/transactions/withdrawal/withdrawal.component').then(
            (m) => m.ClientWithdrawalComponent,
          ),
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./dashboard/documents/documents.component').then((m) => m.DocumentsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./dashboard/profile/profile.component').then((m) => m.ProfileComponent),
      },
      {
        path: 'support',
        loadComponent: () =>
          import('./dashboard/support/support.component').then((m) => m.SupportComponent),
      },
      // Admin Routes
      {
        path: 'admin/clients',
        loadComponent: () =>
          import('./dashboard/admin/clients-list/clients-list.component').then(
            (m) => m.AdminClientsListComponent
          ),
      },
      {
        path: 'admin/accounts',
        loadComponent: () =>
          import('./dashboard/admin/accounts-list/accounts-list.component').then(
            (m) => m.AdminAccountsListComponent
          ),
      },
      {
        path: 'admin/deposit',
        redirectTo: 'transactions/deposit',
        pathMatch: 'full'
      },
      {
        path: 'admin/new-client',
        loadComponent: () =>
          import('./dashboard/admin/new-client/new-client.component').then(
            (m) => m.AdminNewClientComponent
          ),
      },
      {
        path: 'admin/edit-client/:id',
        loadComponent: () =>
          import('./dashboard/admin/edit-client/edit-client.component').then(
            (m) => m.AdminEditClientComponent
          ),
      },
      {
        path: 'admin/edit-account/:id',
        loadComponent: () =>
          import('./dashboard/admin/edit-account/edit-account.component').then(
            (m) => m.AdminEditAccountComponent
          ),
      },
    ],
  },
];
