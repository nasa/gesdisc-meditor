import { Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Store, Select } from '@ngxs/store';
import { AuthState, Logout } from 'app/store/auth/auth.state';

import { environment } from '../../../../environments/environment';



@Component({
	selector: 'med-login-status',
	template: `
		<button mat-button
			(click)="logout()"
			color="accent"
			*ngIf="(user$ | async) as user"
			(mouseenter)="toggleButton()"
			(mouseleave)="toggleButton()">
				<mat-icon>{{ userBtn ? 'person' : 'exit_to_app' }}</mat-icon>
				{{ userBtn ? 'Hi, ' + user.firstName : 'Logout' }}
		</button>
	`
})
export class LoginStatusComponent implements OnInit {

	@Select(AuthState.user) user$: Observable<any>;
	userBtn: boolean = true;

	constructor(private store: Store) {
	}

	ngOnInit() {
	}

	logout() {
		this.store.dispatch(new Logout);
		window.location.href = environment.API_BASE_PATH + '/logout';
	}

	toggleButton() {
		this.userBtn = !this.userBtn;
	}

}
