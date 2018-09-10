import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Model, ModelCatalogEntry} from 'app/service/model/models';
import { DefaultService } from 'app/service/api/default.service';
import * as actions from './model.actions';
import { tap } from 'rxjs/operators';

export * from './model.actions';

export interface ModelStateModel {
	loading: boolean;
	models: ModelCatalogEntry[];
	currentModel: Model;
}

@State<ModelStateModel>({
	name: 'models',
	defaults: {
		loading: false,
		models: [],
		currentModel: undefined,
	},
})
export class ModelState {

	@Selector()
	static loading(state: ModelStateModel): boolean {
		return state.loading;
	}

	@Selector()
	static models(state: ModelStateModel): ModelCatalogEntry[] {
		return state.models;
	}

	@Selector()
	static currentModel(state: ModelStateModel): Model {
		return state.currentModel;
	}

	@Selector()
	static categories(state: ModelStateModel): string[] {        
		let allCategories = state.models.map(m => m.category);
		return [...Array.from(new Set(allCategories))]
	}

	constructor(private store: Store, private service: DefaultService) {}

	@Action(actions.GetAllModels)
	getAllModels({ patchState }: StateContext<ModelStateModel>) {
		patchState({ loading: true, });

		return this.service.listModels()
			.pipe(tap((models: ModelCatalogEntry[]) => patchState({ 
				models,
				loading: false,
			})));
	}

	@Action(actions.GetModel)
	getModel({ patchState, getState }: StateContext<ModelStateModel>, { payload }: actions.GetModel) {
		// find requested model in the state's cached array of models
		let model = getState().models.find((model: ModelCatalogEntry) => model.name === payload.name)

		if (model && !payload.reload) {
			patchState({ currentModel: model });   // use cached model
			return
		} 
		
		// fetch model from the API since either the model hasn't been fetched yet 
		// or a reload has been requested
		
		patchState({ loading: true, });

		return this.service.getModel(payload.name)
			.pipe(
				tap((model: Model) => patchState({ 
					//models: [...getState().models, model],
					currentModel: model,
					loading: false,
				})),
			);
	}

}