import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Model, ModelCatalogEntry, DocCatalogEntry} from 'app/service/model/models';
import { DefaultService } from 'app/service/api/default.service';
import * as actions from './model.actions';
import * as workflowactions from 'app/store/workflow/workflow.actions';
import { tap } from 'rxjs/operators';

export * from './model.actions';

export interface ModelStateModel {
	models: ModelCatalogEntry[];
	currentModel: Model;
	currentModelDocuments: DocCatalogEntry[];
}

@State<ModelStateModel>({
	name: 'models',
	defaults: {
		models: [],
		currentModel: undefined,
		currentModelDocuments: [],
	},
})
export class ModelState {

	@Selector()
	static models(state: ModelStateModel): ModelCatalogEntry[] {
		return state.models;
	}

	@Selector()
	static currentModel(state: ModelStateModel): Model {
		return state.currentModel;
	}

	@Selector()
	static currentModelDocuments(state: ModelStateModel): DocCatalogEntry[] {
		return state.currentModelDocuments;
	}

	@Selector()
	static categories(state: ModelStateModel): string[] {
		const allCategories = state.models.map(m => m.category);
		return [...Array.from(new Set(allCategories))];
	}

	constructor(private store: Store, private service: DefaultService) {}

	@Action(actions.GetAllModels)
	getAllModels({ patchState, getState }: StateContext<ModelStateModel>, { payload }: actions.GetAllModels) {
		const models: any = getState().models;
		const useCache: boolean = models.length && !payload.reload;

		const getAllModelsCallback = (models: any) => {
			patchState({ models });
		};

		if (useCache) {
			return getAllModelsCallback(models);
		} else {
			return this.service.listModels()
				.pipe(tap(getAllModelsCallback));
		}
	}

	@Action(actions.GetModel)
	getModel({ patchState, getState, dispatch }: StateContext<ModelStateModel>, { payload }: actions.GetModel) {
		const model: any = getState().currentModel;
		const useCache: boolean = model && model.name === payload.name && !payload.reload;

		const getModelCallback = (model: any) => {
			patchState({ currentModel: model });
		};

		if (useCache) {
			return getModelCallback(model);
		} else {
			return this.service.getModel(payload.name)
				.pipe(tap(getModelCallback));
		}
	}

	@Action(actions.GetModelDocuments)
	getModelDocuments({ patchState, getState }: StateContext<ModelStateModel>) {
		if (!getState().currentModel) { throw new Error('No selected model'); }

		return this.service.listDocuments(getState().currentModel.name)
			.pipe(tap((currentModelDocuments: DocCatalogEntry[]) => patchState({
				currentModelDocuments,
			})));
	}

}
