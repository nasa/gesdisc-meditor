import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageContainer } from './core/containers/splash-page/splash-page.container';
import { SearchPageContainer } from './search/containers/search-page.container';

export const routes: Routes = [
  {
    path: '',
    component: SplashPageContainer,
   // canActivate: [AuthGuard],
  },
  {
    path: 'search',
    component: SearchPageContainer,
   // canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundPageComponent },
];
