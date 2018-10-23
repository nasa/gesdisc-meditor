import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsStoragePluginModule, StorageOption } from '@ngxs/storage-plugin';


import {
	DocumentState,
	ModelState,
	NotificationState,
	AuthState,
	WorkflowState } from './store/';

import { SnackBarComponent } from './core/components/notification/notification.component';
import { CoreModule } from './core/core.module';
import { ApiModule } from './service/api.module';
import { MaterialModule } from './material';

import { MainComponent } from './core/containers/main/main.component';
import { BASE_PATH } from './service';
import { environment } from '../environments/environment';

import { routes } from './routes';
import { DocumentResolver, ModelResolver, DocEditResolver, ModelsResolver, AuthGuard } from 'app/store/resolvers/';

// const routeResolvers = Object.keys(resolvers).map(key => resolvers[key])	// TODO: remove this and use Object.values (need typescript to support ES2017)
const routeResolvers = [ DocumentResolver, ModelResolver, DocEditResolver, ModelsResolver, AuthGuard ];

@NgModule({
	imports: [
		CommonModule,
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		FlexLayoutModule,
		MaterialModule,
		CoreModule.forRoot(),
		RouterModule.forRoot(routes, { useHash: true }),
		NgxsModule.forRoot([
			DocumentState,
			ModelState,
			NotificationState,
			AuthState,
			WorkflowState ]),
		NgxsRouterPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot({storage: StorageOption.LocalStorage, key: ['auth'], deserialize: JSON.parse,
      serialize: JSON.stringify}),
		NgxsReduxDevtoolsPluginModule.forRoot(),
		ApiModule
	],
	providers: [
		{ provide: BASE_PATH, useValue: environment.API_BASE_PATH },
		...routeResolvers,
	],
	declarations: [ SnackBarComponent ],
	entryComponents: [ SnackBarComponent ],
	bootstrap: [ MainComponent ]
})
export class AppModule { }
