import { Routes } from '@angular/router';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageComponent } from './core/containers/splash-page/splash-page.component';
import { ModelsExistsGuard } from './store/guards/models-exists.guard';
import { AuthGuard } from './auth/services/auth-guard.service';

export const routes: Routes = [
	{
		path: '',
		component: SplashPageComponent
	},
	{
		path: 'auth',
		loadChildren: './auth/auth.module#AuthModule'
	},
	{
		path: 'search',
		loadChildren: './search/search.module#SearchModule',
		canActivate: [ AuthGuard, ModelsExistsGuard ]
	},	
	{
		path: 'document',
		loadChildren: './document/document.module#DocumentModule',
		canActivate: [ AuthGuard, ModelsExistsGuard ]
	},
		{ path: '**', component: NotFoundPageComponent },
	];
