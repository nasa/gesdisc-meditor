import {
  ActionReducerMap,
  createSelector,
  createFeatureSelector
} from '@ngrx/store';
import * as fromModel from '../core/reducers/model.reducer';
import { RouterStateUrl } from '../shared/utils';
import * as fromRouter from '@ngrx/router-store';
// Representation of the entire app state
// Extended by lazy loaded modules
export interface State {
	models: fromModel.ModelState,
	router: fromRouter.RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<State> = {
	models: fromModel.reducer,
	router: fromRouter.routerReducer,
};


export const selectModelState = createFeatureSelector<fromModel.ModelState>('models');

export const getModelIds = createSelector(
	selectModelState,
	fromModel.selectModelIds
);
export const getModelEntities = createSelector(
	selectModelState,
	fromModel.selectModelEntities
);
export const getAllModels = createSelector(
	selectModelState,
	fromModel.selectAllModels
);
export const getResultsTotal = createSelector(
	selectModelState,
	fromModel.selectModelsTotal
);
export const getCurrentModelId = createSelector(
  selectModelState,
  fromModel.getSelectedId
);

export const getCurrentModel= createSelector(
  selectModelState,
  fromModel.getSelectedModel
);

export const getAdminModels = createSelector(
	getAllModels,
	(allModels) => allModels.filter(m => { return m.category == 'Admin'})
);

export const getNonAdminModels = createSelector(
	getAllModels,
	(allModels) => allModels.filter(m => { return m.category != 'Admin'})
);

export const selectCurrentModel = createSelector(
	getModelEntities,
	getCurrentModelId,
	(modelEntities, modelId) => modelEntities[modelId]
);

export const getRouterState = createFeatureSelector<fromRouter.RouterReducerState<RouterStateUrl>>('router');