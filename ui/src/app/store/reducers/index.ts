import { ActionReducer, ActionReducerMap } from '@ngrx/store';
import { RouterStateUrl } from '../../shared/utils';
import * as fromRouter from '@ngrx/router-store';


import * as fromModel from './model.reducer';
import * as fromNotifications from './notification.reducer';

export interface AppState {
  models: fromModel.State;
  notification: fromNotifications.State;
  router: fromRouter.RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<AppState, any> = {
  models: fromModel.reducer,
  notification: fromNotifications.reducer,
  router: fromRouter.routerReducer
};



// console.log all actions
// export function logger(reducer: ActionReducer<AppState>): ActionReducer<AppState> {
// 	return function(state: AppState, action: any): AppState {
// 		console.log('state', state);
// 		console.log('action', action);

// 		return reducer(state, action);
// 	};
// }
