import { Routes } from '@angular/router';
import { Dashboard, LandingPage, Login, Register } from '@features';
import { BaseLayout } from '@shared';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'register', component: Register },
  { path: 'login', component: Login },
  {
    path: 'app',
    component: BaseLayout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
    ],
  },
];
