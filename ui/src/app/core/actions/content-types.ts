import { Action } from '@ngrx/store';
import { ContentType } from '@models/content-type';

export enum ContentTypesActionTypes {
	LoadContentTypes = '[ContentType] Add content types',
	LoadComplete = '[ContentType] Load Complete',
  LoadError = '[ContentType] Load Error',
}

export class LoadContentTypes implements Action {
  readonly type = ContentTypesActionTypes.LoadContentTypes;

  // constructor(public payload: ContentType[]) { }
}

export class LoadComplete implements Action {
  readonly type = ContentTypesActionTypes.LoadComplete;

  constructor(public payload: ContentType[]) {}
}

export class LoadError implements Action {
  readonly type = ContentTypesActionTypes.LoadError;

  constructor(public payload: string) {}
}


export type ContentTypesActions =
	LoadContentTypes
	| LoadComplete
	| LoadError;
