import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { FlexLayoutModule } from '@angular/flex-layout';

// CONTAINERS
import { MainComponent } from './containers/main/main.component';
import { NotFoundPageComponent } from './containers/not-found-page';
import { SplashPageComponent } from './containers/splash-page/splash-page.component';
// COMPONENTS
import { ModelButtonComponent } from './components/model-button/model-button.component';
import { MaterialModule } from '../material';
import { ToolbarComponent } from './components/toolbar/toolbar.component';

import { EffectsModule } from '@ngrx/effects';
import { ModelEffects } from './effects/model.effects';

import { reducers } from '../reducers';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AuthModule } from '../auth/auth.module';
import { SearchModule } from '../search/search.module';
import { DocEditModule } from '../docedit/docedit.module';


export const COMPONENTS = [
	ModelButtonComponent,
	MainComponent,
	NotFoundPageComponent,
	SplashPageComponent,
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
		DocEditModule,
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
