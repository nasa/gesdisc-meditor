import { createSelector } from '@ngrx/store';

import * as fromHistory from '../reducers/history.reducer';
import * as fromFeature from '../reducers';

export const getHistoryState = createSelector(
  fromFeature.getDocumentDataState, 
  (state: fromFeature.DocumentDataState) => state.history
);

export const selectHistoryIds = createSelector(
	getHistoryState,
	fromHistory.selectHistoryIds
);

export const selectHistoryEntities = createSelector(
	getHistoryState,
	fromHistory.selectHistoryEntities
);

export const selectAllHistory = createSelector(
	getHistoryState,
	fromHistory.selectAllHistory
);

export const selectHistoryTotal = createSelector(
	getHistoryState,
	fromHistory.selectHistoryTotal
);

export const getCurrentHistoryItem= createSelector(
  getHistoryState,
  fromHistory.getSelectedHistoryItem
);