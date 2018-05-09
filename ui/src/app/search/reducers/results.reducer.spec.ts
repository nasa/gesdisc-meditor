import { reducer } from './results.reducer';
import * as fromSearch from './results.reducer';
import { Search, SearchComplete, SearchError, ClearResults } from '../actions/result.actions';
import { Document } from '../../service/model/document';

describe('DocumentsReducer', () => {

	const document1 = { title: 'testDocument' };
	const document2 = { ...document1, name: '222' };
	const document3 = { ...document2, name: '333' };
	const initialState: fromSearch.State = {
		ids: [document1.title, document2.name],
		entities: {
			[document1.title]: document1,
			[document2.title]: document2,
		},
		selectedDocumentId: '',
	};

	describe('undefined action', () => {
		it('should return the default state', () => {
			const result = reducer(undefined, {} as any);

			expect(result).toMatchSnapshot();
		});
	});

	describe('SearchComplete', () => {
		function noExistingModels(
			action: any,
			documentsInitialState: any,
			initialState: any,
			documents: Document[]
		) {
			const createAction = new action(documents);

			const result = reducer(documentsInitialState, createAction);

			expect(result).toMatchSnapshot();
		}

		function existingModels(action: any, initialState: any, documents: Document[]) {
			// should not replace existing documents
			const differentDocument2 = { ...documents[0], foo: 'bar' };
			const createAction = new action([documents[1], differentDocument2]);

			const expectedResult = {
				ids: [...initialState.ids, documents[1].title],
				entities: {
					...initialState.entities,
					[documents[1].title]: documents[1],
				},
				selectedModelId: null,
			};

			const result = reducer(initialState, createAction);

			expect(result).toMatchSnapshot();
		}

		it('should add all documents in the payload when none exist', () => {
			noExistingModels(SearchComplete, fromSearch.initialState, initialState, [
				document1,
				document2,
			]);

		});

		it('should add only new documents when documents already exist', () => {
			existingModels(SearchComplete, initialState, [document2, document3]);
		});
	});

	// describe('Select Model', () => {
	// 	it('should set the selected model id on the state', () => {
	// 		const action = new SelectModel(model1.name);

	// 		const result = reducer(initialState, action);

	// 		expect(result).toMatchSnapshot();
	// 	});
	// });

	// describe('Selectors', () => {
	// 	describe('getSelectedId', () => {
	// 		it('should return the selected id', () => {
	// 			const result = fromModels.getSelectedId({
	// 				...initialState,
	// 				selectedModelId: model1.name,
	// 			});

	// 			expect(result).toMatchSnapshot();
	// 		});
	// 	});
	// });
});
