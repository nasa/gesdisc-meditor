import {
	createSelector,
	createFeatureSelector,
	ActionReducerMap,
} from '@ngrx/store';
import * as fromHistory from './history.reducer';
import * as fromDocument from './document.reducer';
import * as fromComments from '../../comments/reducers/comments.reducer';

export interface DocumentDataState {
	history: fromHistory.State;
	document: fromDocument.State;
	comments: fromComments.State;
}

export const reducers: ActionReducerMap<DocumentDataState> = {
	history: fromHistory.reducer,
	document: fromDocument.reducer,
	comments: fromComments.reducer
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


export const selectCommentsState = createSelector(selectDocumentDataState, (state: DocumentDataState) => state.comments);

export const selectCommentsIds = createSelector(
	selectCommentsState,
	fromComments.selectCommentsIds
);
export const selectCommentsEntities = createSelector(
	selectCommentsState,
	fromComments.selectCommentsEntities
);
export const selectAllComments = createSelector(
	selectCommentsState,
	fromComments.selectAllComments
);
export const selectCommentsTotal = createSelector(
	selectCommentsState,
	fromComments.selectCommentsTotal
);

export const selectDocumentState = createSelector(selectDocumentDataState, (state: DocumentDataState) => state.document);

export const getDocument = createSelector(
	selectDocumentState,
	fromDocument.getDocument
);
