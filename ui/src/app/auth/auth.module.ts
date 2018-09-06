import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
//import { LoginPageComponent } from './containers/login-page.component';
import { LoginStatusComponent } from './components/login-status/login-status.component';
import { LoginComponent } from './components/login/login.component';
import { LoginDialog } from './components/login-dialog/login-dialog.component';
import { CallbackComponent } from './components/callback/callback.component';
import { GetUserComponent } from './components/get-user/get-user.component';

import { AuthGuard } from './store/guards/auth.guard';
import { reducers, effects } from './store';
import { MaterialModule } from '../material';
import { routes } from './auth.routing';

export const COMPONENTS = [ LoginComponent, LoginStatusComponent, CallbackComponent, GetUserComponent, LoginDialog ];

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('auth', reducers),
    EffectsModule.forFeature(effects)
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  entryComponents: [ LoginDialog ], 
  providers: [ AuthGuard ],
})
export class AuthModule {}