import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth-guard.service';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageComponent } from './core/containers/splash-page/splash-page.component';
import { SearchPageComponent } from './search/containers/search-page.component';
import { DocEditPageComponent } from './docedit/containers/docedit-page.component';

export const routes: Routes = [
	{
		path: '',
		component: SplashPageComponent,
		// canActivate: [AuthGuard],
	},
	{
		path: 'search',
		component: SearchPageComponent,
		// canActivate: [AuthGuard],
	},
	{
		path: 'edit',
		component: DocEditPageComponent,
		// canActivate: [AuthGuard],
	},
		{ path: '**', component: NotFoundPageComponent },
	];
