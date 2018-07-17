import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageComponent } from './core/containers/splash-page/splash-page.component';

export const routes: Routes = [
	{
		path: '',
		component: SplashPageComponent,
		// canActivate: [AuthGuard],
	},
	{
		path: 'search',
		loadChildren: './search/search.module#SearchModule'
	},
	{
		path: 'edit',
		loadChildren: './docedit/docedit.module#DocEditModule'
	},
		{ path: '**', component: NotFoundPageComponent },
	];
