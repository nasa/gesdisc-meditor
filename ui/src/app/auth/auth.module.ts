import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoginPageComponent } from './containers/login-page.component';
import { LoginComponent } from './components/login.component';
import { CallbackComponent } from './components/callback/callback.component';
import { GetUserComponent } from './components/get-user/get-user.component';

import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { AuthEffects } from './effects/auth.effects';
import { reducers } from './reducers';
import { MaterialModule } from '../material';
import { routes } from './auth.routing';

export const COMPONENTS = [LoginComponent, LoginPageComponent, CallbackComponent, GetUserComponent];

// @NgModule({
//   imports: [CommonModule, ReactiveFormsModule, MaterialModule, FlexLayoutModule],
//   declarations: COMPONENTS,
//   exports: COMPONENTS,
// })
// export class AuthModule {
//   static forRoot(): ModuleWithProviders {
//     return {
//       ngModule: RootAuthModule,
      
//     };
//   }
// }

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('auth', reducers),
    EffectsModule.forFeature([AuthEffects])
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [AuthService, AuthGuard],
})
export class AuthModule {}
