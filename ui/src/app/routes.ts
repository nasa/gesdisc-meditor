import { Routes } from '@angular/router';
import { NotFoundPageComponent } from './core/containers/not-found-page';
import { SplashPageComponent } from './core/containers/splash-page/splash-page.component';
import { ModelsExistsGuard } from './store/guards/models-exists.guard';
import { SelectedModelExistsGuard } from './store/guards/selected-model-exists.guard';
import { AuthGuard } from './auth/store/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		component: SplashPageComponent,
		canActivate: [ ModelsExistsGuard ]
	},
	{
		path: 'auth',
		loadChildren: './auth/auth.module#AuthModule'
	},
	{
		path: 'search',
		loadChildren: './search/search.module#SearchModule',
		canActivate: [ AuthGuard, ModelsExistsGuard, SelectedModelExistsGuard ]
	},	
	{
		path: 'document',
		loadChildren: './document/document.module#DocumentModule',
		canActivate: [ AuthGuard, ModelsExistsGuard, SelectedModelExistsGuard ]
	},
		{ path: '**', component: NotFoundPageComponent },
	];
