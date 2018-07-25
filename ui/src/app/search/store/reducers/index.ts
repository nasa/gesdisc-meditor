import {
	ActionReducerMap,
	createFeatureSelector
} from '@ngrx/store';

import * as fromSearch from './results.reducer';
import * as fromRoot from '../../../store';

export interface State extends fromRoot.AppState {
	results: fromSearch.State;
}

export const reducers: ActionReducerMap<State> = {
	results: fromSearch.reducer
};

export const getSearchState = createFeatureSelector<State>(
  'search'
);
