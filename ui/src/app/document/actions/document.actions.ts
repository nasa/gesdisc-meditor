import { Action } from '@ngrx/store';
import { Document } from '../../service/model/document';

export enum DocumentActionTypes {
	Load = '[Document] Load',
	LoadComplete = '[Document] Load Complete',
	SubmitDocument = '[Document] Submit new document',
	SubmitDocumentComplete = '[Document] Submit new document success '
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class Load implements Action {
	readonly type = DocumentActionTypes.Load;

	constructor(public payload: any) {}
}

export class LoadComplete implements Action {
	readonly type = DocumentActionTypes.LoadComplete;

	constructor(public payload: any) {}
}

export class SubmitDocument implements Action {
	readonly type = DocumentActionTypes.SubmitDocument;

	constructor(public payload: any) {}
}

export class SubmitDocumentComplete implements Action {
	readonly type = DocumentActionTypes.SubmitDocumentComplete;

	constructor() {}
}



/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type DocumentActionsUnion =
	| Load
	| LoadComplete
	| SubmitDocument
	| SubmitDocumentComplete;
