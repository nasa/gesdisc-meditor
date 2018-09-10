import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve, CanActivate } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { AuthState, GetUser } from 'app/store/auth/auth.state';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private store: Store) {}

  @Select(AuthState.loggedIn) loggedIn$: Observable<boolean>;

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {  
    
    return this.loggedIn$.pipe(
      map(authed => {
        console.log('here');
      if (!authed) { 
        localStorage.setItem('returnUrl', state.url);
        this.store.dispatch(new GetUser());
        return false;
      }
      return true;
      }),
      take(1)  
    );
  }
}