import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
	catchError,
	debounceTime,
	map,
	skip,
	switchMap,
	takeUntil,
} from 'rxjs/operators';

import { ContentTypeService } from '../services/content-type/content-type.service';
import {
	ContentTypesActionTypes,
	LoadContentTypes,
	LoadComplete,
	LoadError
} from '../actions/content-types';
import { ContentType } from '@models/content-type';

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
export class ContentTypesEffects {
	@Effect()
	load$: Observable<Action> = this.actions$.pipe(
		ofType<LoadContentTypes>(ContentTypesActionTypes.LoadContentTypes),
		switchMap(() => this.contentTypesService.getContentTypes()),
		map((contentTypes: ContentType[]) =>  new LoadComplete(contentTypes)),
		// catchError(err => of(new LoadError(err)))
	);

	constructor(
		private actions$: Actions,
		private contentTypesService: ContentTypeService) {}
		/**
		 * You inject an optional Scheduler that will be undefined
		 * in normal application usage, but its injected here so that you can mock out
		 * during testing using the RxJS TestScheduler for simulating passages of time.
		 */

}
