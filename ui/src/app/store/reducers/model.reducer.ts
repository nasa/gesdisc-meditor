import { ModelActionTypes, ModelActionsUnion } from '../actions/model.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { Model } from '../../service/model/model';

export interface State extends EntityState<ModelCatalogEntry> {
	loaded: boolean;
  loading: boolean;
	selectedModelId: string;
	selectedModel: Model;
}

export const adapter: EntityAdapter<ModelCatalogEntry> = createEntityAdapter<ModelCatalogEntry>({
  selectId: (model: ModelCatalogEntry) => model.name,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
	loaded: false,
  loading: false,
	selectedModelId: 'Alerts',
	selectedModel: {
		name: '',
		icon: {},
		description: '',
		schema: '',
		layout: '',
		workflow: 'Default'
	 }
});

export function reducer(
	state: State = initialState,
	action: ModelActionsUnion
): State {
	switch (action.type) {
		case ModelActionTypes.LoadModels:
			return {
				...state,
				loading: true
			};

		case ModelActionTypes.LoadModelsComplete:
			return adapter.addMany(action.payload, {
				...state,
				loaded: true,
				loading: false
			});

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
export const getLoaded = (state: State) => state.loaded;
export const getLoading = (state: State) => state.loading;

export const {
  selectIds: selectModelIds,
  selectEntities: selectModelEntities,
  selectAll: selectAllModels,
  selectTotal: selectModelsTotal,
} = adapter.getSelectors();

