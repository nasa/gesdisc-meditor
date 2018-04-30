import { Action } from '@ngrx/store';
import { Model } from '../../service/model/model';

export enum ModelActionTypes {
	SelectModel = '[Model] Select Content Type',
	Load = '[Model] Load content types',
	LoadComplete = '[Model] Load Complete',
	LoadError = '[Model] Load Error',
}

export class SelectModel implements Action {
	readonly type = ModelActionTypes.SelectModel;

	constructor(public payload: string) { }
}

export class Load implements Action {
	readonly type = ModelActionTypes.Load;

	constructor() { }
}

export class LoadComplete implements Action {
	readonly type = ModelActionTypes.LoadComplete;

	constructor(public payload: Model[]) {}
}

export class LoadError implements Action {
	readonly type = ModelActionTypes.LoadError;

	constructor(public payload: any) {}
}


export type ModelActionsUnion =
	| SelectModel
	| Load
	| LoadComplete
	| LoadError;
