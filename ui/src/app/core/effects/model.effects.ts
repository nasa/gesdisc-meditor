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
	ModelActionTypes,
	ModelActionsUnion,
	Load,
	LoadComplete,
	LoadError
} from '../actions/model.actions';
import { Model } from '../../service/model/model';

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
export class ModelEffects {

	@Effect()
	load$: Observable<Action> = this.actions$.pipe(
		ofType(ModelActionTypes.Load),
		switchMap(() =>
			this.modelService
				.listModels()
				.pipe(
					map((models: Model[]) =>  new LoadComplete(models)),
					catchError(err => of(new LoadError(err)))
				)
		)
	);



	constructor(
		private actions$: Actions,
		private modelService: DefaultService) {}
		/**
		 * You inject an optional Scheduler that will be undefined
		 * in normal application usage, but its injected here so that you can mock out
		 * during testing using the RxJS TestScheduler for simulating passages of time.
		 */

}
