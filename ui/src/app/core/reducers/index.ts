import { createSelector, createFeatureSelector } from '@ngrx/store';
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

