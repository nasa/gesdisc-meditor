import { Action } from '@ngrx/store';

export enum AuthActionTypes {
  GetUser = '[Auth] GetUser',
  Logout = '[Auth] Logout',
  OpenLoginDialog = '[Auth] Open Login Dialog',
  CloseLoginDialog = '[Auth] Close Login Dialog',
  LoginSuccess = '[Auth] Login Success',
  LoginFailure = '[Auth] Login Failure',
  LoginRedirect = '[Auth] Login Redirect',
}

export class GetUser implements Action {
  readonly type = AuthActionTypes.GetUser;
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.LoginSuccess;

  constructor(public payload: Object) {}
}

export class LoginFailure implements Action {
  readonly type = AuthActionTypes.LoginFailure;

  constructor(public payload: any) {}
}

export class LoginRedirect implements Action {
  readonly type = AuthActionTypes.LoginRedirect;
}

export class OpenLoginDialog implements Action {
  readonly type = AuthActionTypes.OpenLoginDialog;
}

export class CloseLoginDialog implements Action {
  readonly type = AuthActionTypes.CloseLoginDialog;
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export type AuthActions =
  | GetUser
  | LoginSuccess
  | LoginFailure
  | LoginRedirect
  | OpenLoginDialog
  | CloseLoginDialog
  | Logout;
