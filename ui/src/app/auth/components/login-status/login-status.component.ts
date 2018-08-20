import { Component, OnInit} from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Store, select } from '@ngrx/store';
import * as fromAuth from '../../store';
import { environment } from '../../../../environments/environment';



@Component({
	selector: 'med-login-status',
	template:`	
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
	
	user$: Observable<any>;
	userBtn: boolean = true;

	constructor(private store: Store<fromAuth.AuthState>) {
		this.user$ = store.pipe(select(fromAuth.getUser));
	}

	ngOnInit() {
	}

	logout() {
		this.store.dispatch(new fromAuth.Logout);	
		window.location.href = environment.API_BASE_PATH + '/logout';
	}

	toggleButton() {
		this.userBtn = !this.userBtn;
	}
	
}
