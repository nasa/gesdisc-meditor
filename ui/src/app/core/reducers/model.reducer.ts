import { ModelActionTypes, ModelActionsUnion } from '../actions/model.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { Model } from '../../service/model/model';

export interface ModelState extends EntityState<ModelCatalogEntry> {
	selectedModelId: string;
	selectedModel: Model;
}

export const adapter: EntityAdapter<ModelCatalogEntry> = createEntityAdapter<ModelCatalogEntry>({
  selectId: (model: ModelCatalogEntry) => model.name,
  sortComparer: false,
});

export const initialState: ModelState = adapter.getInitialState({
	selectedModelId: 'Alerts',
	selectedModel: {
		name: '',
		icon: {},
		description: '',
		schema: '',
		layout: ''
	 }
});

export function reducer(
	state: ModelState = initialState,
	action: ModelActionsUnion
): ModelState {
	switch (action.type) {
		case ModelActionTypes.LoadComplete:
			return adapter.addMany(action.payload, state);

		case ModelActionTypes.SelectModel:
			return {
				...state,
				selectedModelId: action.payload
			}

		case ModelActionTypes.LoadSelectedModelComplete:
			return {
				...state,
				selectedModel: action.payload
			}

		default:
			return state;
	}
}

export const getSelectedId = (state: ModelState) => state.selectedModelId;
export const getSelectedModel = (state: ModelState) => state.selectedModel;

export const {
  selectIds: selectModelIds,
  selectEntities: selectModelEntities,
  selectAll: selectAllModels,
  selectTotal: selectModelsTotal,
} = adapter.getSelectors();

