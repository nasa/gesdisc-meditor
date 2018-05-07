import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
	catchError,
	map,
	switchMap
} from 'rxjs/operators';

import { DefaultService } from '../../service/api/default.service';
import {
	ResultActionTypes,
	ResultActionsUnion,
	Search,
	SearchComplete,
	SearchError,
	ClearResults
} from '../actions/result.actions';
import { Document } from '../../service/model/document';

/**
 * Effects offer a way to isolate and easily test side-effects within your
 * application.
 *
 * If you are unfamiliar with the operators being used in these examples, please
 * check out the sources below:
 *
 * Official Docs: http://reactivex.io/rxjs/manual/overview.html#categories-of-operators
 * RxJS 5 Operators By Example: https://gist.github.com/btroncone/d6cf141d6f2c00dc6b35
 */

@Injectable()
export class ResultEffects {

	@Effect()
	search$: Observable<Action> = this.actions$.pipe(
		ofType<Search>(ResultActionTypes.Search),
		map(action => action.payload),
		switchMap(model =>
			this.searchService
				.listDocuments(model)
				.pipe(
					switchMap((results: Document[]) =>  [new ClearResults(), new SearchComplete(results)]),
					catchError(err => of(new SearchError(err)))
				)
		)
	);



	constructor(
		private actions$: Actions,
		private searchService: DefaultService) {}
		/**
		 * You inject an optional Scheduler that will be undefined
		 * in normal application usage, but its injected here so that you can mock out
		 * during testing using the RxJS TestScheduler for simulating passages of time.
		 */

}
