import { Action } from '@ngrx/store';
import { Comment } from '../../../service/model/comment';

export enum CommentsActionTypes {
	LoadComments = '[Comments] Load',
	LoadCommentsComplete = '[Comments] Load Complete',
	SubmitComment = '[Comment] Submit new comment',
	SubmitCommentComplete = '[Comment] Submit new comment success ',
	ResolveComment = '[Comment] Resolve comment',
	ResolveCommentComplete = '[Comment] Resolve comment success ',
	ClearComments = '[Comments] Clear Comments'
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class LoadComments implements Action {
	readonly type = CommentsActionTypes.LoadComments;

	constructor(public payload: string) {}
}

export class LoadCommentsComplete implements Action {
	readonly type = CommentsActionTypes.LoadCommentsComplete;

	constructor(public payload: Comment[]) {}
}

export class SubmitComment implements Action {
	readonly type = CommentsActionTypes.SubmitComment;

	constructor(public payload: any) {}
}

export class SubmitCommentComplete implements Action {
	readonly type = CommentsActionTypes.SubmitCommentComplete;

	constructor() {}
}

export class ResolveComment implements Action {
	readonly type = CommentsActionTypes.ResolveComment;

	constructor(public payload: string) {}
}

export class ResolveCommentComplete implements Action {
	readonly type = CommentsActionTypes.ResolveCommentComplete;

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
	| LoadComments
	| LoadCommentsComplete
	| SubmitComment
	| SubmitCommentComplete
	| ResolveComment
	| ResolveCommentComplete
	| ClearComments;
