import { createSelector } from '@ngrx/store';

import * as fromSearch from '../reducers/results.reducer';
import * as fromFeature from '../reducers';

export const getResultsState = createSelector(
  fromFeature.getSearchState,
  (state: fromFeature.State) => state.results
);

export const selectResultIds = createSelector(
	getResultsState,
	fromSearch.selectResultIds
);

export const selectResultEntities = createSelector(
	getResultsState,
	fromSearch.selectResultEntities
);

export const selectAllResults = createSelector(
	getResultsState,
	fromSearch.selectAllResults
);

export const selectResultsTotal = createSelector(
	getResultsState,
	fromSearch.selectResultsTotal
);
