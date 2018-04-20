import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageContainer } from './core/containers/splash-page/splash-page.container';

export const routes: Routes = [
  { path: '', redirectTo: '/splash', pathMatch: 'full' },
  {
    path: 'splash',
    component: SplashPageContainer,
   // canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundPageComponent },
];
