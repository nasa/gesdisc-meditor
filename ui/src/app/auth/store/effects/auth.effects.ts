import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { Router } from '@angular/router';
import { tap, catchError, switchMap } from 'rxjs/operators';

import { DefaultService } from '../../../service/api/default.service';
import {
  GetUser,
  LoginRedirect,
  LoginSuccess,
  LoginFailure,
  AuthActionTypes,
} from '../actions/auth.actions';

import { NotificationOpen } from '../../../store';


@Injectable()
export class AuthEffects {
  
  @Effect()
  getUser$ = this.actions$.pipe(
    ofType<GetUser>(AuthActionTypes.GetUser),
    switchMap(() =>
      this.authService
        .getMe()
        .pipe(
          switchMap((user: Object) => [ 
            new LoginSuccess(user),
            new NotificationOpen({message: 'You have successfully logged in', config: 'success'})]
          ),
          catchError(err => of(new NotificationOpen({message: err.statusText, config: 'failure'})))
        )
      )
  );

  @Effect({ dispatch: false })
  loginSuccess$ = this.actions$.pipe(
    ofType<LoginSuccess>(AuthActionTypes.LoginSuccess),
    tap(() => this.router.navigateByUrl(localStorage.getItem('returnUrl') || '/'))
  );

  @Effect({ dispatch: false })
  loginRedirect$ = this.actions$.pipe(
    ofType<LoginRedirect>(AuthActionTypes.LoginRedirect),
    tap(() => {
      this.router.navigate(['/login'])
    })
  );

  constructor(
    private actions$: Actions,
    private authService: DefaultService,
    private router: Router
  ) {}
}
