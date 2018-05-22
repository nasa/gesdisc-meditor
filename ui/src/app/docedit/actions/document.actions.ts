import { Action } from '@ngrx/store';
import { Document } from '../../service/model/document';

export enum DocumentActionTypes {
	Load = '[Document] Load',
	LoadComplete = '[Load] Load Complete',
	LoadError = '[Load] Load Error',
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

export class LoadError implements Action {
	readonly type = DocumentActionTypes.LoadError;

	constructor(public payload: string) {}
}


/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type DocumentActionsUnion =
	| Load
	| LoadComplete
	| LoadError;
