import { reducer } from './model.reducer';
import * as fromModels from './model.reducer';
import { LoadComplete, Load, SelectModel } from '../actions/model.actions';
import { Model } from '../../service/model/model';

describe('ModelsReducer', () => {
	//const book1 = generateMockBook();
	const model1 = { name: 'testModel', description: 'testDescription'};
	const model2 = { ...model1, name: '222' };
	const model3 = { ...model2, name: '333' };
	const initialState: fromModels.State = {
		ids: [model1.name, model2.name],
		entities: {
			[model1.name]: model1,
			[model2.name]: model2,
		},
		selectedModelId: 'Alerts',
	};

	describe('undefined action', () => {
		it('should return the default state', () => {
			const result = reducer(undefined, {} as any);

			expect(result).toMatchSnapshot();
		});
	});

	describe('Load Complete', () => {
		function noExistingModels(
			action: any,
			modelsInitialState: any,
			initialState: any,
			models: Model[]
		) {
			const createAction = new action(models);

			const result = reducer(modelsInitialState, createAction);

			expect(result).toMatchSnapshot();
		}

		function existingModels(action: any, initialState: any, models: Model[]) {
			// should not replace existing models
			const differentModel2 = { ...models[0], foo: 'bar' };
			const createAction = new action([models[1], differentModel2]);

			const expectedResult = {
				ids: [...initialState.ids, models[1].name],
				entities: {
					...initialState.entities,
					[models[1].name]: models[1],
				},
				selectedModelId: null,
			};

			const result = reducer(initialState, createAction);

			expect(result).toMatchSnapshot();
		}

		it('should add all models in the payload when none exist', () => {
			noExistingModels(LoadComplete, fromModels.initialState, initialState, [
				model1,
				model2,
			]);

		});

		it('should add only new models when models already exist', () => {
			existingModels(LoadComplete, initialState, [model2, model3]);
		});
	});

	describe('Select Model', () => {
		it('should set the selected model id on the state', () => {
			const action = new SelectModel(model1.name);

			const result = reducer(initialState, action);

			expect(result).toMatchSnapshot();
		});
	});

	describe('Selectors', () => {
		describe('getSelectedId', () => {
			it('should return the selected id', () => {
				const result = fromModels.getSelectedId({
					...initialState,
					selectedModelId: model1.name,
				});

				expect(result).toMatchSnapshot();
			});
		});
	});
});
