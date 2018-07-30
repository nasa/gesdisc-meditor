import { Action } from '@ngrx/store';
import { Document } from '../../../service/model/document';

export enum DocumentActionTypes {
	LoadDocument = '[Document] Load Document',
	LoadDocumentComplete = '[Document] Load Document Complete',
	LoadDocumentFail = '[Document] Load Document Fail',
	LoadVersion = '[Document] Load Version',
	LoadVersionComplete = '[Document] Load Version Complete',
	LoadVersionFail = '[Document] Load Vesrsion Fail',
	SubmitDocument = '[Document] Submit new document',
	SubmitDocumentComplete = '[Document] Submit new document success',
	SubmitDocumentFail = '[Document] Submit new document fail '
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class LoadDocument implements Action {
	readonly type = DocumentActionTypes.LoadDocument;

	constructor(public payload: any) {}
}

export class LoadDocumentComplete implements Action {
	readonly type = DocumentActionTypes.LoadDocumentComplete;

	constructor(public payload: Document) {}
}

export class LoadVersion implements Action {
	readonly type = DocumentActionTypes.LoadVersion;

	constructor(public payload: any) {}
}

export class LoadVersionComplete implements Action {
	readonly type = DocumentActionTypes.LoadVersionComplete;

	constructor(public payload: Document) {}
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
	| LoadDocument
	| LoadDocumentComplete
	| LoadVersion
	| LoadVersionComplete
	| SubmitDocument
	| SubmitDocumentComplete;
