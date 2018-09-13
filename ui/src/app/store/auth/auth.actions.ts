export class OpenLoginDialog {
	static readonly type = '[Auth] Open Login Dialog';
}

export class GetUser {
	static readonly type = '[Auth] Get User';
}

export class GetUserPrivileges {
	static readonly type = '[Auth] Get User Privileges';
}

export class LoginSuccess {
	static readonly type = '[Auth] Login Success';

	constructor(public payload: any) {}
}

export class LoginFailure  {
	static readonly type = '[Auth] Login Failure';

	constructor(public payload: any) {}
}

export class Logout {
	static readonly type = '[Auth] Logout';
}
