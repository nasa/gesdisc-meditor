import {
	createFeatureSelector,
	ActionReducerMap,
} from '@ngrx/store';
import * as fromHistory from './history.reducer';
import * as fromDocument from './document.reducer';

export interface DocumentDataState {
	history: fromHistory.State;
	document: fromDocument.State;
}

export const reducers: ActionReducerMap<DocumentDataState> = {
	history: fromHistory.reducer,
	document: fromDocument.reducer
};

export const getDocumentDataState = createFeatureSelector<DocumentDataState>('documentData');


