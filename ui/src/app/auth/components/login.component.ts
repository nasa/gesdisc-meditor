import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Store, select } from '@ngrx/store';
import { Authenticate } from '../models/user';
import * as fromAuth from '../reducers';
import * as Auth from '../actions/auth';



@Component({
	selector: 'med-login',
	template:`
	<a mat-raised-button (click)="login()" color="primary" *ngIf="!(loginStatus$ | async)">Earthdata Login</a>
	<div *ngIf="(user$ | async) as user" class="user-box">Hi, {{user.name}}</div>`
})
export class LoginComponent implements OnInit {

	loginStatus$: Observable<boolean>;
	user$: Observable<any>;

	constructor(private store: Store<fromAuth.State>) {
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
