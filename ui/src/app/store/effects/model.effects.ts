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
	LoadModels,
	LoadModelsComplete,
	LoadModelsError,
	LoadSelectedModel,
	LoadSelectedModelComplete,
	LoadSelectedModelError
} from '../actions/model.actions';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { Model } from '../../service/model/model';
import { pipe } from '../../../../node_modules/@angular/core/src/render3/pipe';

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
		ofType(ModelActionTypes.LoadModels),
		switchMap(() =>
			this.defaultService
				.listModels()
				.pipe(
					map((models: ModelCatalogEntry[]) =>  new LoadModelsComplete(models)),
					catchError(err => of(new LoadModelsError(err)))
				)
		)
	);

	//TODO: Maybe rewrite to not reload workflow if it hasn't changed?

	@Effect()
	loadSelected$: Observable<Action> = this.actions$.pipe(
		ofType<LoadSelectedModel>(ModelActionTypes.LoadSelectedModel),
		map(action => action.payload),
		switchMap(payload =>
			this.defaultService
				.getModel(payload)
				.pipe(
					switchMap((model: Model) =>
						this.defaultService
							.getDocument('Workflows', model.workflow)
							.pipe(
								switchMap((workflow) => {
									model.workflow = workflow.doc;
									return of(new LoadSelectedModelComplete(model))
								}),
								catchError(err => of(new LoadSelectedModelError(err)))
							)
					)
				)
		)
	);



	constructor(
		private actions$: Actions,
		private defaultService: DefaultService) {}
		/**
		 * You inject an optional Scheduler that will be undefined
		 * in normal application usage, but its injected here so that you can mock out
		 * during testing using the RxJS TestScheduler for simulating passages of time.
		 */

}
