import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { LoginPageComponent } from './containers/login-page.component';
import { LoginComponent } from './components/login/login.component';
import { CallbackComponent } from './components/callback/callback.component';
import { GetUserComponent } from './components/get-user/get-user.component';

import { AuthGuard } from './store/guards/auth.guard';
import { reducers, effects } from './store';
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
    EffectsModule.forFeature(effects)
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: [ AuthGuard ],
})
export class AuthModule {}
