import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Store, select } from '@ngrx/store';
import { Authenticate } from '../models/user';
import * as fromAuth from '../reducers';
import * as Auth from '../actions/auth';
import { CookieService } from 'ngx-cookie-service';



@Component({
	selector: 'med-login',
	template:
	`
		<a mat-raised-button (click)="login()" color="warn" *ngIf="!loginStatus$">Earthdata Login</a>
		<div *ngIf="(user$ | async) as user" class="user-box">Hi, {{user.name}}</div>
	`
	,
	styles: [
	`
		:host {
			display: flex;
			justify-content: center;
			margin: 72px 0;
		}

		.mat-form-field {
			width: 100%;
			min-width: 300px;
		}

		mat-card-title,
		mat-card-content {
			display: flex;
			justify-content: center;
		}

		.loginError {
			padding: 16px;
			width: 300px;
			color: white;
			background-color: red;
		}

		.loginButtons {
			display: flex;
			flex-direction: row;
			justify-content: flex-end;
		}

		.user-box {
			color: black;
		}
	`,
	],
})
export class LoginComponent implements OnInit {

	loginStatus$: Observable<boolean>;
	user$: Observable<any>;

	constructor(private store: Store<fromAuth.State>, private cookieService: CookieService) {
		this.loginStatus$ = store.pipe(select(fromAuth.getLoggedIn));
		this.user$ = store.pipe(select(fromAuth.getUser));
	}

	ngOnInit() {
		this.store.dispatch(new Auth.GetUser());
	}

	login() {
		this.store.dispatch(new Auth.LoginRedirect());
		// window.location.href = 'http://localhost:4201/login';
	}

	// onSubmit($event: Authenticate) {
	// 	this.store.dispatch(new Auth.Login($event));
	// }


}
