import { 
  ActionReducer, 
  ActionReducerMap,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { RouterStateUrl } from '../../shared/utils';
import * as fromRouter from '@ngrx/router-store';

import * as fromModel from './model.reducer';
import * as fromNotifications from './notification.reducer';
import * as fromWorkflow from './workflow.reducer';
/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';

export interface AppState {
  models: fromModel.State;
  notification: fromNotifications.State;
  workflow: fromWorkflow.State;
  router: fromRouter.RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<AppState, any> = {
  models: fromModel.reducer,
  notification: fromNotifications.reducer,
  workflow: fromWorkflow.reducer,
  router: fromRouter.routerReducer
};



// console.log all actions
export function logger(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
	return function(state: AppState, action: any): AppState {
		console.log('state', state);
		console.log('action', action);

		return reducer(state, action);
	};
}

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? [logger, storeFreeze]
  : [];
