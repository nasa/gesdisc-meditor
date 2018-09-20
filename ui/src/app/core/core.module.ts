import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material';

// CONTAINERS
import { MainComponent } from './containers/main/main.component';
import { NotFoundPageComponent } from './containers/not-found-page';
import { SplashPageComponent, 
//	LoginDialog 
} from './containers/splash-page/splash-page.component';
// COMPONENTS
import { ModelButtonComponent } from './components/model-button/model-button.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { LoadingComponent } from './components/loading/loading.component';
import { NotificationComponent } from './components/notification/notification.component';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { PipesModule } from '../shared/pipes';
import { AuthModule } from '../auth/auth.module';


export const COMPONENTS = [
	ModelButtonComponent,
	MainComponent,
	NotFoundPageComponent,
	SplashPageComponent,
	ToolbarComponent,
	LoadingComponent,
	NotificationComponent,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		MaterialModule,
		FlexLayoutModule,
		AuthModule,
		AngularFontAwesomeModule,
		PipesModule
	],
	declarations: COMPONENTS,
	exports: COMPONENTS,
})
export class CoreModule {
	static forRoot() {
		return {
			ngModule: CoreModule
		};
	}
}
