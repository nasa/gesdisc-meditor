import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { _throw } from 'rxjs/observable/throw';
import { User } from '../models/user';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AuthService {
	constructor() {}

	login(): Observable<User> {
		/**
		 * Simulate a failed login to display the error
		 * message for the login form.
		 */
		if (true) {
			return _throw('Invalid username or password');
			//return of({ name: 'User' });
		}

		//return of({ name: 'User' });
	}

	logout() {
		return of(true);
	}
}
