import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageComponent } from './core/containers/splash-page';

export const routes: Routes = [
	{ path: '', redirectTo: '/splash', pathMatch: 'full' },
  { path: 'home', redirectTo: '/splash', pathMatch: 'full' },
  {
    path: 'splash',
    component: SplashPageComponent,
   // canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundPageComponent },
];
