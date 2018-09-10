import { ModelActionTypes, ModelActionsUnion } from '../actions/model.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { Model } from '../../service/model/model';

export interface State extends EntityState<ModelCatalogEntry> {
	loadedModels: boolean;
	loadingModels: boolean;
	loadedSelectedModel: boolean,
	selectedModelId: string;
	selectedModel: Model;
}

export const adapter: EntityAdapter<ModelCatalogEntry> = createEntityAdapter<ModelCatalogEntry>({
  selectId: (model: ModelCatalogEntry) => model.name,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
	loadedModels: false,
	loadingModels: false,
	loadedSelectedModel: false,
	selectedModelId: '',
	selectedModel: {
		name: '',
		icon: {},
		description: '',
		schema: '',
		layout: '',
		workflow: '',
		initEdge: ''
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
				loadingModels: true
			};

		case ModelActionTypes.LoadModelsComplete:
			return adapter.addMany(action.payload, {
				...state,
				loadedModels: true,
				loadingModels: false
			});

		case ModelActionTypes.SelectModel:
			return {
				...state,
				selectedModelId: action.payload
			}

		case ModelActionTypes.LoadSelectedModelComplete:
			return {
				...state,
				selectedModel: action.payload,
				loadedSelectedModel: true
			}

		default:
			return state;
	}
}

export const getSelectedId = (state: State) => state.selectedModelId;
export const getSelectedModel = (state: State) => state.selectedModel;
export const getLoadedModels = (state: State) => state.loadedModels;
export const getLoadingModels = (state: State) => state.loadingModels;
export const getSelectedModelLoaded = (state: State) => state.loadedSelectedModel;

export const {
  selectIds: selectModelIds,
  selectEntities: selectModelEntities,
  selectAll: selectAllModels,
  selectTotal: selectModelsTotal,
} = adapter.getSelectors();

