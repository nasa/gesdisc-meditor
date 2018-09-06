import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs/observable/of';
import { Router } from '@angular/router';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import { DefaultService } from '../../../service/api/default.service';
import {
  GetUser,
  LoginRedirect,
  LoginSuccess,
  LoginFailure,
  AuthActionTypes,
  OpenLoginDialog,
} from '../actions/auth.actions';

import { NotificationOpen } from '../../../store';
import { LoginDialog } from '../../components/login-dialog/login-dialog.component';


@Injectable()
export class AuthEffects {
  
  @Effect()
  getUser$ = this.actions$.pipe(
    ofType<GetUser>(AuthActionTypes.GetUser),
    switchMap(() =>
      this.authService
        .getMe()
        .pipe(
          switchMap((user: any) => {
            return user.uid ? of(new LoginSuccess(user)) : of(new OpenLoginDialog())              
          }),
          catchError(err => of(new NotificationOpen({message: err.statusText, config: 'failure'})))
        )
      )
  );

  @Effect()
    openDialog = this.actions$.pipe(
      ofType(AuthActionTypes.OpenLoginDialog),
      switchMap(_ => {
        let dialogRef = this.dialog.open(LoginDialog, {
          width: '400px',
          position: { top: '200px' },
          disableClose: true
        });
        return dialogRef.afterClosed();
      }),
      map((result: any) => {
        if (result === undefined) {
          return new OpenLoginDialog();
        }
        console.log(result);
        return new LoginSuccess(result)
      }),
  );

  // @Effect()
  //   closeDialog = this.actions$.pipe(
  //     ofType(AuthActionTypes.CloseLoginDialog),
  //     tap(() => {
  //       this.dialog.closeAll();
  //     })
  // );

  @Effect()
    logout$ = this.actions$.pipe(
      ofType(AuthActionTypes.Logout),
      tap(() => {
        this.router.navigate(['/logout'])
      })
  );


  @Effect()
  loginSuccess$ = this.actions$.pipe(
    ofType<LoginSuccess>(AuthActionTypes.LoginSuccess),
    switchMap(() => {
      this.router.navigateByUrl(localStorage.getItem('returnUrl') || '/');      
      return of(new NotificationOpen({message: 'You have successfully logged in', config: 'success'}));
    })
  );

  constructor(
    private actions$: Actions,
    private authService: DefaultService,
    private router: Router,
    private dialog: MatDialog
  ) {}
}
