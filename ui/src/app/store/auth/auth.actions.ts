export class GetLoggedIn {
  static readonly type = '[Auth] Get Logged in';
};

export class GetUser {
  static readonly type = '[Auth] Get User';
}

export class LoginSuccess {
  static readonly type = '[Auth] Login Success';

  constructor(public payload: Object) {}
}

export class LoginFailure  {
  static readonly type = '[Auth] Login Failure';

  constructor(public payload: any) {}
}

export class Logout implements Action {
  rstatic readonly type = '[Auth] Logout';
}