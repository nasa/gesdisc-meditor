import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoginPageComponent } from './containers/login-page.component';
import { LoginComponent } from './components/login.component';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { AuthEffects } from './effects/auth.effects';
import { reducers } from './reducers';
import { MaterialModule } from '../material';
import { AuthConfig, JwksValidationHandler, OAuthModule, ValidationHandler } from '../../libs/angular-oauth2-oidc/angular-oauth2-oidc/src';

export const COMPONENTS = [LoginComponent, LoginPageComponent];

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, FlexLayoutModule],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class AuthModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RootAuthModule,
      providers: [AuthService, AuthGuard],
    };
  }
}

@NgModule({
  imports: [
    AuthModule,
    RouterModule.forChild([{ path: 'login', component: LoginPageComponent }]),
    StoreModule.forFeature('auth', reducers),
    EffectsModule.forFeature([AuthEffects]),
    OAuthModule.forRoot()
  ],
  exports: [ LoginComponent ]
})
export class RootAuthModule {}
