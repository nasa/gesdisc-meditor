import { ModelActionTypes, ModelActionsUnion } from '../actions/model.actions';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Model } from '../../service/model/model';

export interface State extends EntityState<Model> {
	selectedModelId: string;
}

export const adapter: EntityAdapter<Model> = createEntityAdapter<Model>({
  selectId: (model: Model) => model.name,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
	selectedModelId: 'Alerts'
});

export function reducer(
	state: State = initialState,
	action: ModelActionsUnion
): State {
	switch (action.type) {
		case ModelActionTypes.LoadComplete:
			return adapter.addMany(action.payload, state);

		case ModelActionTypes.SelectModel:
			return {
				...state,
				selectedModelId: action.payload
			}

		default:
			return state;
	}
}

export const getSelectedId = (state: State) => state.selectedModelId;

export const {
  selectIds: selectModelIds,
  selectEntities: selectModelEntities,
  selectAll: selectAllModels,
  selectTotal: selectModelsTotal,
} = adapter.getSelectors();

