import { Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Store, select } from '@ngrx/store';
import * as fromAuth from '../../store';
import { environment } from '../../../../environments/environment';



@Component({
	selector: 'med-login',
	template:`
	<button mat-button (click)="login()" color="accent" *ngIf="!(loginStatus$ | async)">
		<mat-icon>person</mat-icon>
		Login
	</button>
	<button mat-button (click)="logout()" color="accent" *ngIf="(user$ | async) as user" (mouseenter)="toggleButton()" (mouseleave)="toggleButton()">		
			<mat-icon>{{ userBtn ? 'person' : 'exit_to_app' }}</mat-icon>
			{{ userBtn ? user.uid : 'Logout' }}		
	</button>
	`
})
export class LoginComponent implements OnInit {
	
	loginStatus$: Observable<boolean>;
	user$: Observable<any>;
	userBtn: boolean = true;

	constructor(private store: Store<fromAuth.AuthState>) {
		this.loginStatus$ = store.pipe(select(fromAuth.getLoggedIn));
		this.user$ = store.pipe(select(fromAuth.getUser));
	}

	ngOnInit() {
	}

	login() {	
		window.location.href = environment.API_BASE_PATH + '/login';
	}

	logout() {
		this.store.dispatch(new fromAuth.Logout);	
		window.location.href = environment.API_BASE_PATH + '/logout';
	}

	toggleButton() {
		this.userBtn = !this.userBtn;
	}
	
}