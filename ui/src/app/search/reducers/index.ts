import {
	createSelector,
	createFeatureSelector,
	ActionReducerMap,
} from '@ngrx/store';
import * as fromSearch from './results.reducer';

export interface State {
	results: fromSearch.State;
}

export const reducers: ActionReducerMap<State> = {
	results: fromSearch.reducer,
};

export const selectSearchState = createFeatureSelector<fromSearch.State>('results');

export const selectResultIds = createSelector(
	selectSearchState,
	fromSearch.selectResultIds
);
export const selectResultEntities = createSelector(
	selectSearchState,
	fromSearch.selectResultEntities
);
export const selectAllResults = createSelector(
	selectSearchState,
	fromSearch.selectAllResults
);
export const selectResultsTotal = createSelector(
	selectSearchState,
	fromSearch.selectResultsTotal
);
