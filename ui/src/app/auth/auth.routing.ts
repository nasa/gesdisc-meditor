import { Routes } from '@angular/router';

import { CallbackComponent } from './components/callback/callback.component';
import { GetUserComponent } from './components/get-user/get-user.component';

export const routes: Routes = [
	{
		path: 'getuser',
		component: GetUserComponent
	},
	{ path: 'callback',
		component: CallbackComponent
	}
];
