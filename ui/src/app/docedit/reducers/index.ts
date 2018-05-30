import {
	createSelector,
	createFeatureSelector,
	ActionReducerMap,
} from '@ngrx/store';
import * as fromHistory from './history.reducer';
import * as fromDocument from './document.reducer';

export interface State {
	history: fromHistory.State;
	document: fromDocument.State;
}

export const reducers: ActionReducerMap<State> = {
	history: fromHistory.reducer,
	document: fromDocument.reducer,
};

export const selectHistoryState = createFeatureSelector<fromHistory.State>('history');

export const selectHistoryIds = createSelector(
	selectHistoryState,
	fromHistory.selectHistoryIds
);
export const selectHistoryEntities = createSelector(
	selectHistoryState,
	fromHistory.selectHistoryEntities
);
export const selectAllHistory = createSelector(
	selectHistoryState,
	fromHistory.selectAllHistory
);
export const selectHistoryTotal = createSelector(
	selectHistoryState,
	fromHistory.selectHistoryTotal
);


export const selectDocumentState = createFeatureSelector<fromDocument.State>('currentDoc');

export const getDocument = (state: State) => state.document.currentDocument;
