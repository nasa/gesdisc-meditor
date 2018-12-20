import { Injectable } from '@angular/core';
import { RouterStateSnapshot, CanActivate } from '@angular/router';
import { Select } from '@ngxs/store';
import { AuthState } from 'app/store/auth/auth.state';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
	
	@Select(AuthState.loggedIn) loggedIn$: Observable<boolean>;

	canActivate(route: any, state: RouterStateSnapshot): Observable<boolean> {
		return this.loggedIn$.pipe(map((isLoggedIn: boolean) => {
			localStorage.setItem('returnUrl', state.url);		

			return isLoggedIn
		}), take(1));
	}

}
