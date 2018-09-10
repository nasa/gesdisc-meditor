import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Model, } from '../../service/model/model';
import { DefaultService } from '../../service/api/default.service';
import * as actions from './model.actions';
import { tap } from 'rxjs/operators';

export * from './model.actions';

export interface ModelStateModel {
    loading: boolean;
    models: Model[];
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
    static models(state: ModelStateModel): Model[] {
        return state.models;
    }

    @Selector()
    static currentModel(state: ModelStateModel): Model {
        return state.currentModel;
    }

    constructor(private store: Store, private service: DefaultService) {}

    @Action(actions.GetAllModels)
    getAllModels({ patchState }: StateContext<ModelStateModel>, { payload }: actions.GetAllModels) {
        patchState({ loading: true, });

        return this.service.listModels()
            .pipe(tap((models: Model[]) => patchState({ 
                models,
                loading: false,
            })));
    }

    @Action(actions.GetModel)
    getModel({ patchState, getState }: StateContext<ModelStateModel>, { payload }: actions.GetModel) {
        // find requested model in the state's cached array of models
        let model = getState().models.find((model: Model) => model.name === payload.name)

        if (model && !payload.reload) {
            patchState({ currentModel: model, });   // use cached model
            return
        } 
        
        // fetch model from the API since either the model hasn't been fetched yet 
        // or a reload has been requested
        
        patchState({ loading: true, });

        return this.service.getModel(payload.name)
            .pipe(
                tap((model: Model) => patchState({ 
                    models: [...getState().models, model],
                    currentModel: model,
                    loading: false,
                })),
            );
    }

}