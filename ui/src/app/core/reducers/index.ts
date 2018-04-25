import { createSelector, createFeatureSelector, ActionReducerMap } from '@ngrx/store';
import * as fromContentTypes from './content-types';

export interface ContentTypesState {
  contentTypes: fromContentTypes.State;
}

export interface State {
  contentTypes: ContentTypesState;
}

export const reducers = {
  contentTypes: fromContentTypes.reducer
};

export const selectContentTypesState = createFeatureSelector<ContentTypesState>('contentTypes');


export const getContentTypesEntitiesState = createSelector(
  selectContentTypesState,
  state => state.contentTypes
);

export const {
  selectIds: getContentTypeIds,
  selectEntities: getContentTypeEntities,
  selectAll: getAllContentTypes,
  selectTotal: getTotalContentTypes,
} = fromContentTypes.adapter.getSelectors(getContentTypesEntitiesState);
// export const selectContentTypesIds = createSelector(selectContentTypesState, fromContentTypes.selectContentTypesIds);
// export const selectContentTypesEntities = createSelector(selectContentTypesState, fromContentTypes.selectContentTypesEntities);
// export const selectAllContentTypes = createSelector(selectContentTypesState, fromContentTypes.selectAllContentTypes);
// export const selectContentTypesTotal = createSelector(selectContentTypesState, fromContentTypes.selectContentTypesTotal);
// export const selectCurrentUserId = createSelector(selectUserState, fromContentTypes.getSelectedUserId);

// export const selectCurrentUser = createSelector(
//   selectUserEntities,
//   selectCurrentUserId,
//   (userEntities, userId) => userEntities[userId]
// );
