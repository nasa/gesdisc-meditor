import { Action } from '@ngrx/store';
import { DocHistory } from '../../service/model/docHistory';

export enum HistoryActionTypes {
	Load = '[History] Load',
	LoadComplete = '[History] Load Complete',
	SetSelectedHistoryItem = '[History] Set Selected History Item',
	ClearHistory = '[History] Clear History'
}

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class Load implements Action {
	readonly type = HistoryActionTypes.Load;

	constructor(public payload: { model : string, title: string }) {}
}

export class LoadComplete implements Action {
	readonly type = HistoryActionTypes.LoadComplete;

	constructor(public payload: DocHistory[]) {}
}

export class SetSelectedHistoryItem implements Action {
	readonly type = HistoryActionTypes.SetSelectedHistoryItem;

	constructor(public payload: string) {}
}

export class ClearHistory implements Action {
	readonly type = HistoryActionTypes.ClearHistory;
}


/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type HistoryActionsUnion =
	| Load
	| LoadComplete
	| SetSelectedHistoryItem
	| ClearHistory;
