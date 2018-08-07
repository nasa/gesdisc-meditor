import { Action } from '@ngrx/store';
import { User, Authenticate } from '../models/user';

export enum AuthActionTypes {
  GetUser = '[Auth] GetUser',
  Logout = '[Auth] Logout',
  LoginSuccess = '[Auth] Login Success',
  LoginCallback = '[Auth] Login Callback',
  LoginFailure = '[Auth] Login Failure',
  LoginRedirect = '[Auth] Login Redirect',
}

export class GetUser implements Action {
  readonly type = AuthActionTypes.GetUser;
}

export class LoginSuccess implements Action {
  readonly type = AuthActionTypes.LoginSuccess;

<<<<<<< HEAD
  constructor(public payload: Object) {}
=======
  constructor(public payload: User) {}
}

export class LoginCallback implements Action {
  readonly type = AuthActionTypes.LoginCallback;

  constructor(public payload: string) {}
>>>>>>> 58c3fd25434c01efed8927bc8045b7a611cd1612
}

export class LoginFailure implements Action {
  readonly type = AuthActionTypes.LoginFailure;

  constructor(public payload: any) {}
}

export class LoginRedirect implements Action {
  readonly type = AuthActionTypes.LoginRedirect;
}

export class Logout implements Action {
  readonly type = AuthActionTypes.Logout;
}

export type AuthActions =
  | GetUser
  | LoginSuccess
  | LoginCallback
  | LoginFailure
  | LoginRedirect
  | Logout;
