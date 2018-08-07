import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { tap, map, exhaustMap, catchError, switchMap } from 'rxjs/operators';

import { DefaultService } from '../../service/api/default.service';
import {
  GetUser,
  LoginRedirect,
  LoginSuccess,
  LoginFailure,
  AuthActionTypes,
} from '../actions/auth';
import { User } from '../models/user';

@Injectable()
export class AuthEffects {
  @Effect()
  getUser$ = this.actions$.pipe(
    ofType(AuthActionTypes.GetUser),
    //map((action: GetUser) => action.payload),
    switchMap(() =>
      this.authService
        .getMe()
        .pipe(
          switchMap((user: Object) => of(new LoginSuccess(user))),
          catchError(error => of(new LoginFailure(error)))
        )
    )
  );

  @Effect({ dispatch: false })
  loginSuccess$ = this.actions$.pipe(
    ofType(AuthActionTypes.LoginSuccess),
    tap(() => this.router.navigate(['/']))
  );

  // @Effect({ dispatch: false })
  // loginRedirect$ = this.actions$.pipe(
  //   ofType(AuthActionTypes.LoginRedirect, AuthActionTypes.Logout),
  //   tap(authed => {
  //     // this.router.navigate(['http://localhost:4201/login']);
  //     window.location.href = 'http://localhost:4201/login';
  //   })
  // );

  constructor(
    private actions$: Actions,
    private authService: DefaultService,
    private router: Router
  ) {}
}
