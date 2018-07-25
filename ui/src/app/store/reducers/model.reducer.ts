import { ModelActionTypes, ModelActionsUnion } from '../actions/model.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { Model } from '../../service/model/model';

export interface State extends EntityState<ModelCatalogEntry> {
	selectedModelId: string;
	selectedModel: Model;
}

export const adapter: EntityAdapter<ModelCatalogEntry> = createEntityAdapter<ModelCatalogEntry>({
  selectId: (model: ModelCatalogEntry) => model.name,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
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
	state: State = initialState,
	action: ModelActionsUnion
): State {
	switch (action.type) {
		case ModelActionTypes.LoadModelsComplete:
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

export const getSelectedId = (state: State) => state.selectedModelId;
export const getSelectedModel = (state: State) => state.selectedModel;

export const {
  selectIds: selectModelIds,
  selectEntities: selectModelEntities,
  selectAll: selectAllModels,
  selectTotal: selectModelsTotal,
} = adapter.getSelectors();

