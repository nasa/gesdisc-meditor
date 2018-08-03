import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { tap, map, exhaustMap, catchError, switchMap } from 'rxjs/operators';

import { DefaultService } from '../../service/api/default.service';
import * as fromApp from '../../store';
import {
  GetUser,
  LoginRedirect,
  LoginSuccess,
  LoginCallback,
  LoginFailure,
  AuthActionTypes,
} from '../actions/auth';
import { User } from '../models/user';

@Injectable()
export class AuthEffects {
  // @Effect()
  // login$ = this.actions$.pipe(
  //   ofType(AuthActionTypes.GetUser),
  //   //map((action: GetUser) => action.payload),
  //   exhaustMap(() =>
  //     this.authService
  //       .login()
  //       .pipe(
  //         map(user => new LoginSuccess({ user })),
  //         catchError(error => of(new LoginFailure(error)))
  //       )
  //   )
  // );

  // @Effect({ dispatch: false })
  // loginSuccess$ = this.actions$.pipe(
  //   ofType(AuthActionTypes.LoginSuccess),
  //   tap(() => this.router.navigate(['/']))
  // );

  @Effect({ dispatch: false })
  loginRedirect$: Observable<Action> = this.actions$.pipe(
    ofType<LoginRedirect>(AuthActionTypes.LoginRedirect),
    exhaustMap(() =>
      this.authService.login(undefined, 'events', true)
        .pipe(
          switchMap(event =>{ console.log(event); return of(new LoginSuccess({name:'test'}))}),
          catchError(err => of(new LoginFailure(err)))
        )    
    )
  );

  @Effect({ dispatch: false })
  loginCallback$: Observable<Action> = this.actions$.pipe(
    ofType<LoginCallback>(AuthActionTypes.LoginCallback),
    map(action => action.payload),
    exhaustMap(code => {
      console.log(code);
      return this.authService.login(code, 'events', true)
        .pipe(
          switchMap(event =>{ console.log(event); return of(new LoginSuccess({name:'test'}))}),
          catchError(err => of(new LoginFailure(err)))
        )    
    })
  );

  constructor(
    private actions$: Actions,
    private authService: DefaultService
  ) {}
}
