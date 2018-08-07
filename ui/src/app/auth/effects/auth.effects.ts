import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { Router } from '@angular/router';
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
    ofType<GetUser>(AuthActionTypes.GetUser),
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
    ofType<LoginSuccess>(AuthActionTypes.LoginSuccess),
    tap(() => this.router.navigate(['/']))
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
