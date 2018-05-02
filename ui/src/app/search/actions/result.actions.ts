import { Action } from '@ngrx/store';
import { Document } from '../../service/model/document';

export enum ResultActionTypes {
	Search = '[Result] Search',
	SearchComplete = '[Result] Search Complete',
	SearchError = '[Result] Search Error',
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class Search implements Action {
	readonly type = ResultActionTypes.Search;

	constructor(public payload: string) {}
}

export class SearchComplete implements Action {
	readonly type = ResultActionTypes.SearchComplete;

	constructor(public payload: Document[]) {}
}

export class SearchError implements Action {
	readonly type = ResultActionTypes.SearchError;

	constructor(public payload: string) {}
}


/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type ResultActionsUnion =
	| Search
	| SearchComplete
	| SearchError;
