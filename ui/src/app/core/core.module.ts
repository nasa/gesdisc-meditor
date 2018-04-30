import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { FlexLayoutModule } from '@angular/flex-layout';
// CONTAINERS
import { MainComponent } from './containers/main';
import { NotFoundPageComponent } from './containers/not-found-page';
import { SplashPageComponent } from './containers/splash-page.component';
// COMPONENTS
import { ModelButtonComponent } from './components/model-button/model-button.component';
import { LayoutComponent } from './components/layout';
import { MaterialModule } from '../material';
import { NavItemComponent } from './components/nav-item';
import { SidenavComponent } from './components/sidenav';
import { ToolbarComponent } from './components/toolbar';

import { EffectsModule } from '@ngrx/effects';
import { ModelEffects } from './effects/model.effects';

import { reducers } from '../reducers';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AuthModule } from '../auth/auth.module';
import { SearchModule } from '../search/search.module';


export const COMPONENTS = [
	ModelButtonComponent,
	LayoutComponent,
	MainComponent,
	NotFoundPageComponent,
	SplashPageComponent,
	NavItemComponent,
	SidenavComponent,
	ToolbarComponent,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		MaterialModule,
		FlexLayoutModule,
		AngularFontAwesomeModule,
		AuthModule.forRoot(),
		SearchModule.forRoot(),
		EffectsModule.forFeature([ModelEffects]),
	],
	declarations: COMPONENTS,
	exports: COMPONENTS
	})

export class CoreModule {
		static forRoot() {
		return {
			ngModule: CoreModule
		};
	}
}
