import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { MatDialog } from '@angular/material';
import { Document, DocHistory } from 'app/service/model/models';
import { DefaultService } from 'app/service/api/default.service';
import * as actions from './auth.actions';
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
		constructor(private store: Store, private service: DefaultService, private dialog: MatDialog) {}

		@Action(actions.GetUser)
			getUser({ patchState, getState, dispatch }: StateContext<AuthStateModel>, action: actions.GetUser) {
				return this.service.getMe()
						.pipe(
								tap((user: any) => {
									return user.uid ? dispatch(new actions.LoginSuccess(user)) : dispatch(new actions.OpenLoginDialog())              
								}
							),
						);
		}

		@Action(actions.LoginSuccess)
			loginSuccess({ patchState, getState }: StateContext<AuthStateModel>, { payload }: actions.LoginSuccess) {
				patchState({ user: payload, loggedIn: true });
		}

		@Action(actions.Logout)
			logout({ patchState, getState }: StateContext<AuthStateModel>, { }: actions.Logout) {
				patchState({ user: null, loggedIn: false });
		}

		@Action(actions.OpenLoginDialog)
			openLoginDialog({ patchState, getState }: StateContext<AuthStateModel>, { }: actions.OpenLoginDialog) {
				let dialogRef = this.dialog.open(LoginDialog, {
          width: '400px',
          position: { top: '200px' },
          disableClose: true
        });
		}

}