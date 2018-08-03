import { Routes } from '@angular/router';

import { CallbackComponent } from './components/callback/callback.component';
import { LoginPageComponent } from './containers/login-page.component';

export const routes: Routes = [
  { path: '', 
    component: LoginPageComponent 
  },
  { path: 'callback', 
    component: CallbackComponent 
  }
];
