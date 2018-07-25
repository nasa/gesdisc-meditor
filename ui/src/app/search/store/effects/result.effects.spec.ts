import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { cold, hot } from 'jasmine-marbles';
import { empty, Observable } from 'rxjs';

import { DefaultService } from '../../service/api/default.service';
import { Search, SearchComplete, SearchError, ClearResults } from '../actions/result.actions';
import { Document } from '../../service/model/document';
import { ResultEffects } from './result.effects';

export class TestActions extends Actions {
	constructor() {
		super(empty());
	}

	set stream(source: Observable<any>) {
		this.source = source;
	}
}

export function getActions() {
	return new TestActions();
}

describe('ResultEffects', () => {
	let effects: ResultEffects;
	let defaultService: any;
	let actions$: TestActions;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ResultEffects,
				{
					provide: DefaultService,
					useValue: { listDocuments: jest.fn() },
				},
				{ provide: Actions, useFactory: getActions },
			],
		});

		effects = TestBed.get(ResultEffects);
		defaultService = TestBed.get(DefaultService);
		actions$ = TestBed.get(Actions);
	});

	describe('search$', () => {
		it('should return a new result.SearchComplete, with the results, on success', () => {
			const document1 = { title: 'testDocument1' } as Document;
			const document2 = { title: 'testDocument2' } as Document;
			const documents = [document1, document2];
			const action = new Search('test');
			const completion1 = new ClearResults();
			const completion2 = new SearchComplete(documents);

			actions$.stream = hot('-a', { a: action });
			const response = cold('-a|', { a: documents });
			const expected = cold('--(bc)', { b: completion1, c: completion2 });
			defaultService.listDocuments = jest.fn(() => response);

			expect(effects.search$).toBeObservable(expected);
		});

		it('should return a new book.SearchError if the books service throws', () => {
			const action = new Search('test1');
			const completion = new SearchError('Unexpected Error. Try again later.');
			const error = 'Unexpected Error. Try again later.';

			actions$.stream = hot('-a', { a: action });
			const response = cold('-#|', {}, error);
			const expected = cold('--b', { b: completion });
			defaultService.listDocuments = jest.fn(() => response);

			expect(effects.search$).toBeObservable(expected);
		});

		it('should not do anything if the query is an empty string', () => {
			const action = new Search('');
			const completion = new SearchError('Error: Parameter (model) is required');
			const error = 'Error: Parameter (model) is required';

			actions$.stream = hot('-a', { a: action });
			const response = cold('-#|', {}, error);
			const expected = cold('--b', { b: completion });
			defaultService.listDocuments = jest.fn(() => response);
			// const expected = cold('---');

			expect(effects.search$).toBeObservable(expected);
		});
	});
});
