import { Routes } from '@angular/router';

import { CallbackComponent } from './components/callback/callback.component';
//import { LoginPageComponent } from './containers/login-page.component';
import { GetUserComponent } from './components/get-user/get-user.component';

export const routes: Routes = [
  // { path: 'login', 
  //   component: LoginPageComponent 
  // },
  {
    path: 'getuser',
    component: GetUserComponent
  },
  { path: 'callback', 
    component: CallbackComponent 
  }
];
