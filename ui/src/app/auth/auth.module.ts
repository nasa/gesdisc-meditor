import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginStatusComponent } from './components/login-status/login-status.component';
import { LoginDialog } from './components/login-dialog/login-dialog.component';
import { CallbackComponent } from './components/callback/callback.component';
import { GetUserComponent } from './components/get-user/get-user.component';

import { MaterialModule } from '../material';
import { routes } from './auth.routing';

export const COMPONENTS = [ LoginStatusComponent, CallbackComponent, GetUserComponent, LoginDialog ];

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		FlexLayoutModule,
		RouterModule.forChild(routes)
	],
	declarations: COMPONENTS,
	exports: COMPONENTS,
	entryComponents: [ LoginDialog ]
})
export class AuthModule {}
