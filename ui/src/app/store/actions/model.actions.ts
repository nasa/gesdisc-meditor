import { Action } from '@ngrx/store';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { Model } from '../../service/model/model';

export enum ModelActionTypes {
	SelectModel = '[Model] Select model',
	LoadModels = '[Model] Load models',
	LoadModelsComplete = '[Model] Load complete',
	LoadModelsError = '[Model] Load error',
	LoadSelectedModel = '[Model] Load extended version of selected model',
	LoadSelectedModelComplete = '[Model] Load extended version of selected model complete',
	LoadSelectedModelError = '[Model] Load extended version of selected model error'
}

export class SelectModel implements Action {
	readonly type = ModelActionTypes.SelectModel;

	constructor(public payload: string) { }
}

export class LoadModels implements Action {
	readonly type = ModelActionTypes.LoadModels;

	constructor() { }
}

export class LoadModelsComplete implements Action {
	readonly type = ModelActionTypes.LoadModelsComplete;

	constructor(public payload: ModelCatalogEntry[]) {}
}

export class LoadModelsError implements Action {
	readonly type = ModelActionTypes.LoadModelsError;

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
	| LoadModels
	| LoadModelsComplete
	| LoadModelsError
	| LoadSelectedModel
	| LoadSelectedModelComplete
	| LoadSelectedModelError;
