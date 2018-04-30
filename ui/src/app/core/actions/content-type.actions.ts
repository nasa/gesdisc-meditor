import { Action } from '@ngrx/store';
import { ContentType } from '../../models/content-type';

export enum ContentTypesActionTypes {
	SelectContentType = '[ContentType] Select Content Type',
	LoadContentTypes = '[ContentType] Load content types',
	LoadComplete = '[ContentType] Load Complete',
	LoadError = '[ContentType] Load Error',
}

export class SelectContentType implements Action {
	readonly type = ContentTypesActionTypes.SelectContentType;

	constructor(public payload: string) { }
}

export class LoadContentTypes implements Action {
	readonly type = ContentTypesActionTypes.LoadContentTypes;

	constructor() { }
}

export class LoadComplete implements Action {
	readonly type = ContentTypesActionTypes.LoadComplete;

	constructor(public payload: ContentType[]) {}
}

export class LoadError implements Action {
	readonly type = ContentTypesActionTypes.LoadError;

	constructor(public payload: any) {}
}


export type ContentTypesActions =
	| SelectContentType
	| LoadContentTypes
	| LoadComplete
	| LoadError;
