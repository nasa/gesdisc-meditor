import { Action } from '@ngrx/store';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { Model } from '../../service/model/model';

export enum ModelActionTypes {
	SelectModel = '[Model] Select Content Type',
	Load = '[Model] Load content types',
	LoadComplete = '[Model] Load complete',
	LoadError = '[Model] Load error',
	LoadSelectedModel = '[Model] Load extended version of selected content type',
	LoadSelectedModelComplete = '[Model] Load extended version of selected content type complete',
	LoadSelectedModelError = '[Model] Load extended version of selected content type error'
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

	constructor(public payload: ModelCatalogEntry[]) {}
}

export class LoadError implements Action {
	readonly type = ModelActionTypes.LoadError;

	constructor(public payload: any) {}
}

export class LoadSelectedModel implements Action {
	readonly type = ModelActionTypes.LoadSelectedModel;

	constructor(public payload: string) {}
}

export class LoadSelectedModelComplete implements Action {
	readonly type = ModelActionTypes.LoadSelectedModelComplete;

	constructor(public payload: Model) {}
}

export class LoadSelectedModelError implements Action {
	readonly type = ModelActionTypes.LoadSelectedModelComplete;

	constructor(public payload: any) {}
}


export type ModelActionsUnion =
	| SelectModel
	| Load
	| LoadComplete
	| LoadError
	| LoadSelectedModel
	| LoadSelectedModelComplete
	| LoadSelectedModelError;
