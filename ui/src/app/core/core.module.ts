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
import { ContentTypeButtonComponent } from './components/content-type-button/content-type-button.component';
import { LayoutComponent } from './components/layout';
import { MaterialModule } from '../material';
import { NavItemComponent } from './components/nav-item';
import { SidenavComponent } from './components/sidenav';
import { ToolbarComponent } from './components/toolbar';

import { EffectsModule } from '@ngrx/effects';
import { ContentTypesEffects } from './effects/content-types';

import { reducers } from '../reducers';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AuthModule } from '../auth/auth.module';
import { SearchModule } from '../search/search.module';


export const COMPONENTS = [
	ContentTypeButtonComponent,
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
		StoreModule.forFeature('contentTypes', reducers),
		EffectsModule.forFeature([ContentTypesEffects]),
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
