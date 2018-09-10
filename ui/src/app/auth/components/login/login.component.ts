import { Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Store, Select } from '@ngxs/store';
import { AuthState, Logout } from 'app/store/auth/auth.state';

import { environment } from '../../../../environments/environment';



@Component({
	selector: 'med-login',
	template:`
	<button mat-button (click)="login()" color="accent" *ngIf="!(loginStatus$ | async)">
		<mat-icon>person</mat-icon>
		Login
	</button>
	<button mat-button (click)="logout()" color="accent" *ngIf="(user$ | async) as user" 
		(mouseenter)="toggleButton()" 
		(mouseleave)="toggleButton()">		
			<mat-icon>{{ userBtn ? 'person' : 'exit_to_app' }}</mat-icon>
			{{ userBtn ? user.uid : 'Logout' }}		
	</button>
	`
})
export class LoginComponent implements OnInit {	
	
	@Select(AuthState.loggedIn) loginStatus$: Observable<boolean>;
	@Select(AuthState.user) user$: Observable<any>;
	userBtn: boolean = true;

	constructor(private store: Store) {
	}

	ngOnInit() {
	}

	login() {	
		window.location.href = environment.API_BASE_PATH + '/login';
	}

	logout() {
		this.store.dispatch(new Logout());	
		window.location.href = environment.API_BASE_PATH + '/logout';
	}

	toggleButton() {
		this.userBtn = !this.userBtn;
	}
	
}