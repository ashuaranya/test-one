import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/github-connect',
    pathMatch: 'full'
  },
  {
    path: 'github-connect',
    loadComponent: () => import('./github-connect/github-connect.component').then(m => m.GithubConnectComponent)
  }
];
