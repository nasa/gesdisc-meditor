import { Routes } from '@angular/router';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageComponent } from './core/containers/splash-page/splash-page.component';
import { ModelsExistsGuard } from './store/guards/models-exists.guard';
import { LoginPageComponent } from './auth/containers/login-page.component';

export const routes: Routes = [
	{
		path: '',
		component: SplashPageComponent
	},
	{
<<<<<<< HEAD
		path: 'auth',
		loadChildren: './auth/auth.module#AuthModule'
=======
		path: 'login',
		component: LoginPageComponent
>>>>>>> 58c3fd25434c01efed8927bc8045b7a611cd1612
	},
	{
		path: 'search',
		loadChildren: './search/search.module#SearchModule',
		canActivate: [ ModelsExistsGuard ]
	},	
	{
		path: 'document',
		loadChildren: './document/document.module#DocumentModule',
		canActivate: [ ModelsExistsGuard ]
	},
		{ path: '**', component: NotFoundPageComponent },
	];
