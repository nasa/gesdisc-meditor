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
	DocumentActionTypes,
	DocumentActionsUnion,
	Load,
	LoadComplete,
	SubmitDocument,
	SubmitDocumentComplete
} from '../actions/document.actions';
import { NotificationOpen } from '../../core/actions/notification.actions';

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
export class DocumentEffects {

	@Effect()
	load$: Observable<Action> = this.actions$.pipe(
		ofType<Load>(DocumentActionTypes.Load),
		map(action => action.payload),
		switchMap(payload =>
			this.documentService
				.getDocument(payload.model, payload.title, payload.version)
				.pipe(
					switchMap((document: Document[]) =>  of(new LoadComplete(document))),
					catchError(err => of(new NotificationOpen({message: err.statusText, action: 'Fail'})))
				)
		)
	);

	@Effect()
	submit$: Observable<Action> = this.actions$.pipe(
		ofType<SubmitDocument>(DocumentActionTypes.SubmitDocument),
		map(action => action.payload),
		switchMap(payload =>
			this.documentService
				.putDocument(new Blob([JSON.stringify(payload)]))
				.pipe(
					switchMap(res => [
						new SubmitDocumentComplete(),
						new NotificationOpen({message: "Document added", action: 'Success'})
					]),
					catchError(err => of(new NotificationOpen({message: err.statusText, action: 'Fail'})))
				)
		)
	);



	constructor(
		private actions$: Actions,
		private documentService: DefaultService) {}
		/**
		 * You inject an optional Scheduler that will be undefined
		 * in normal application usage, but its injected here so that you can mock out
		 * during testing using the RxJS TestScheduler for simulating passages of time.
		 */

}
