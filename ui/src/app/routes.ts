import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageComponent } from './core/containers/splash-page/splash-page.component';
import { SearchPageContainer } from './search/containers/search-page.container';

export const routes: Routes = [
  {
    path: '',
    component: SplashPageComponent,
   // canActivate: [AuthGuard],
  },
  {
    path: 'search',
    component: SearchPageContainer,
   // canActivate: [AuthGuard],
  },
  { path: '**', component: NotFoundPageComponent },
];
