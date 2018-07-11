import { Action } from '@ngrx/store';
import { Comment } from '../../service/model/comment';

export enum CommentsActionTypes {
	Load = '[Comments] Load',
	LoadComplete = '[Comments] Load Complete',
	LoadError = '[Comments] Load Error',
	SubmitComment = '[Comment] Submit new comment',
	SubmitCommentComplete = '[Comment] Submit new comment success ',
	SubmitCommentError = '[Comment] Submit new comment error',
	ResolveComment = '[Comment] Resolve comment',
	ResolveCommentComplete = '[Comment] Resolve comment success ',
	ResolveCommentError = '[Comment] Resolve comment error',
	ClearComments = '[Comments] Clear Comments'
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class Load implements Action {
	readonly type = CommentsActionTypes.Load;

	constructor(public payload: string) {}
}

export class LoadComplete implements Action {
	readonly type = CommentsActionTypes.LoadComplete;

	constructor(public payload: Comment[]) {}
}

export class LoadError implements Action {
	readonly type = CommentsActionTypes.LoadError;

	constructor(public payload: string) {}
}

export class SubmitComment implements Action {
	readonly type = CommentsActionTypes.SubmitComment;

	constructor(public payload: any) {}
}

export class SubmitCommentComplete implements Action {
	readonly type = CommentsActionTypes.SubmitCommentComplete;

	constructor() {}
}

export class SubmitCommentError implements Action {
	readonly type = CommentsActionTypes.SubmitCommentError;

	constructor(public payload: string) {}
}

export class ResolveComment implements Action {
	readonly type = CommentsActionTypes.ResolveComment;

	constructor(public payload: string) {}
}

export class ResolveCommentComplete implements Action {
	readonly type = CommentsActionTypes.ResolveCommentComplete;

	constructor(public payload: string) {}
}

export class ResolveCommentError implements Action {
	readonly type = CommentsActionTypes.ResolveCommentError;

	constructor(public payload: string) {}
}

export class ClearComments implements Action {
	readonly type = CommentsActionTypes.ClearComments;
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type CommentsActionsUnion =
	| Load
	| LoadComplete
	| LoadError
	| SubmitComment
	| SubmitCommentComplete
	| SubmitCommentError
	| ResolveComment
	| ResolveCommentComplete
	| ResolveCommentError
	| ClearComments;
