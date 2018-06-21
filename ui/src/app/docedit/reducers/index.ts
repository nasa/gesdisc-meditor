import {
	createSelector,
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
	document: fromDocument.reducer,
};

export const selectDocumentDataState = createFeatureSelector<DocumentDataState>('documentData');

export const selectHistoryState = createSelector(selectDocumentDataState, (state: DocumentDataState) => state.history);

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

export const getCurrentHistoryItem= createSelector(
  selectHistoryState,
  fromHistory.getSelectedHistoryItem
);


export const selectDocumentState = createSelector(selectDocumentDataState, (state: DocumentDataState) => state.document);

export const getDocument = createSelector(
	selectDocumentState,
	fromDocument.getDocument
);
