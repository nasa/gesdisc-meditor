import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { DefaultService } from 'app/service/api/default.service';
import * as actions from './auth.actions';
import * as notification from 'app/store/notification/notification.actions';
import { tap } from 'rxjs/operators';

import { LoginDialog } from 'app/auth/components/login-dialog/login-dialog.component';

export * from './auth.actions';


//TODO type User later

export interface AuthStateModel {
	loggedIn: boolean;
	user: any;
}

@State<AuthStateModel>({
		name: 'auth',
		defaults: {
			loggedIn: false,
			user: null
		},
})
export class AuthState {

		@Selector() static loggedIn(state: AuthStateModel): boolean { return state.loggedIn; }
		@Selector() static user(state: AuthStateModel): any { return state.user; }

		constructor(
			private store: Store,
			private service: DefaultService,
			private dialog: MatDialog,
			private router: Router) {}

		@Action(actions.GetUser)
			getUser({ patchState, getState, dispatch }: StateContext<AuthStateModel>, action: actions.GetUser) {
				return this.service.getMe()
						.pipe(
								tap((user: any) => {
									return user.uid ? dispatch(new actions.LoginSuccess(user)) : dispatch(new actions.OpenLoginDialog());
								}
							),
						);
		}

		@Action(actions.LoginSuccess)
			loginSuccess({ patchState, getState, dispatch }: StateContext<AuthStateModel>, { payload }: actions.LoginSuccess) {
				patchState({ user: payload, loggedIn: true });
				this.router.navigateByUrl(localStorage.getItem('returnUrl') || '/');
				return dispatch(new notification.SuccessNotificationOpen('You have successfully logged in'));
		}

		@Action(actions.Logout)
			logout({ patchState, getState }: StateContext<AuthStateModel>, { }: actions.Logout) {
				patchState({ user: null, loggedIn: false });
				this.router.navigate(['/']);
		}

		@Action(actions.OpenLoginDialog)
			openLoginDialog({ patchState, getState }: StateContext<AuthStateModel>, { }: actions.OpenLoginDialog) {
				const dialogRef = this.dialog.open(LoginDialog, {
					width: '400px',
					position: { top: '200px' },
					disableClose: true
				});
		}

}
