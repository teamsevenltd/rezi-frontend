import { Routes } from '@angular/router';
import { SiteLayoutComponent } from './layout/site-layout/site-layout.component';
import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { SettingComponent } from './modules/shared/setting/setting.component';
import { authGuard } from './auth/auth.guard';
import { PublicComponent } from './modules/shared/public/public.component';
import { SuccessComponent } from './pages/success/success.component';
import { DeclineComponent } from './pages/decline/decline.component';

export const routes: Routes = [
  {
    path: '',
    // component: SiteLayoutComponent,
    children: [
      { path: '', component: LoginComponent, data: { title: 'app.login_to_account' } },
      { path: 'login', component: LoginComponent, data: { title: 'app.login_to_account' } },
      {
        path: 'register',
        component: RegisterComponent,
        data: { title: 'app.register' },
      },
      {
        path: 'forget-password',
        component: ForgotPasswordComponent,
        data: { title: 'app.forgot_password' },
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        data: { title: 'app.reset_password_page' },
      },
      {
        path: 'success',
        component: SuccessComponent,
        data: { title: 'app.payment_successful' },
      },
      {
        path: 'cancel',
        component: DeclineComponent,
        data: { title: 'app.payment_cancelled' },
      },
    ],
  },
  {
    path: 'superadmin',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'superadmin' },
    loadChildren: () =>
      import('./modules/superadmin/superadmin.routing').then(
        (m) => m.superadminRoutes
      ),
  },

  {
    path: 'medicalprovider',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'medicalprovider' },
    loadChildren: () =>
      import('./modules/medicalprovider/medicalprovider.routing').then(
        (m) => m.medicalproviderRoutes
      ),
  },

  {
    path: '',
    component: SiteLayoutComponent,
    children: [
      {
        path: 'public/:id',
        component: PublicComponent,
        data: { title: 'Stepeer' }
      },
      {
        path: 'public/:id/:id',
        component: PublicComponent,
        data: { title: 'Chat' }
      },
    ]
  },
];
