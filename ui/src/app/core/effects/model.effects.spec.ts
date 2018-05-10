import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { cold, hot } from 'jasmine-marbles';
import { empty, Observable } from 'rxjs';

import { DefaultService } from '../../service/api/default.service';
import { Load, LoadComplete, LoadError } from '../actions/model.actions';
import { Model } from '../../service/model/model';
import { ModelEffects } from './model.effects';

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

describe('ModelEffects', () => {
	let effects: ModelEffects;
	let defaultService: any;
	let actions$: TestActions;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ModelEffects,
				{
					provide: DefaultService,
					useValue: { listModels: jest.fn() },
				},
				{ provide: Actions, useFactory: getActions },
			],
		});

		effects = TestBed.get(ModelEffects);
		defaultService = TestBed.get(DefaultService);
		actions$ = TestBed.get(Actions);
	});

	describe('search$', () => {
		it('should return a new result.LoadComplete, with the results, on success', () => {
			const model1 = { name: 'testDocument1', description: 'testDescription1' } as Model;
			const model2 = { name: 'testDocument2', description: 'testDescription2' } as Model;
			const models = [model1, model2];
			const action = new Load();
			const completion = new LoadComplete(models);

			actions$.stream = hot('-a', { a: action });
			const response = cold('-a|', { a: models });
			const expected = cold('--b', { b: completion });
			defaultService.listModels = jest.fn(() => response);

			expect(effects.load$).toBeObservable(expected);
		});

		it('should return a new book.SearchError if the books service throws', () => {
			const action = new Load();
			const completion = new LoadError('Unexpected Error. Try again later.');
			const error = 'Unexpected Error. Try again later.';

			actions$.stream = hot('-a', { a: action });
			const response = cold('-#|', {}, error);
			const expected = cold('--b', { b: completion });
			defaultService.listModels = jest.fn(() => response);

			expect(effects.load$).toBeObservable(expected);
		});
	});
});
