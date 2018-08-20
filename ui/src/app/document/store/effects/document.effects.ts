import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import {
	catchError,
	map,
	switchMap
} from 'rxjs/operators';

import { DefaultService } from '../../../service/api/default.service';
import {
	DocumentActionTypes,
	DocumentActionsUnion,
	LoadDocument,
	LoadDocumentComplete,
	LoadVersion,
	LoadVersionComplete,
	SubmitDocument,
	SubmitDocumentComplete
} from '../actions/document.actions';
import {
	LoadHistory
} from '../actions/history.actions';
import { NotificationOpen, Go } from '../../../store';

import { Document } from '../../../service/model/document';

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
	loadDocument$: Observable<Action> = this.actions$.pipe(
		ofType<LoadDocument>(DocumentActionTypes.LoadDocument),
		map(action => action.payload),
		switchMap(payload =>
			this.documentService
				.getDocument(payload.model, payload.title)
				.pipe(
					switchMap((document: Document) => of(new LoadDocumentComplete(document))), 
					catchError(err => of(new NotificationOpen({message: err.statusText, config: 'failure'})))
				)
		)
	);

	@Effect()
	loadVersion$: Observable<Action> = this.actions$.pipe(
		ofType<LoadVersion>(DocumentActionTypes.LoadVersion),
		map(action => action.payload),
		switchMap(payload =>
			this.documentService
				.getDocument(payload.model, payload.title, payload.version)
				.pipe(
					switchMap((document: Document) =>[
						new LoadVersionComplete(document),
						new NotificationOpen({message: 'Document loaded', config: 'success'})
					]), 
					catchError(err => of(new NotificationOpen({message: err.statusText, config: 'failure'})))
				)
		)
	);

	// @Effect()
	// loadComplete$: Observable<Action> = this.actions$.pipe(
	// 	ofType<LoadDocumentComplete>(DocumentActionTypes.LoadDocumentComplete),
	// 	map(action => action.payload),
	// 	switchMap(payload => {console.log(payload);
	// 		return of(new LoadHistory({model: payload['x-meditor'].model, title: payload.doc['abstract']}))}), 
	// 	catchError(err => of(new NotificationOpen({message: err.statusText, config: 'failure'})))
	// );

	@Effect()
	submit$: Observable<Action> = this.actions$.pipe(
		ofType<SubmitDocument>(DocumentActionTypes.SubmitDocument),
		map(action => action.payload),
		switchMap(payload =>
			this.documentService
				.putDocument(new Blob([JSON.stringify(payload)]))
				.pipe(
					switchMap(() => [
						new SubmitDocumentComplete(),
						new Go({path: ['/document/edit'], query: { model: payload['x-meditor'].model, title: payload.title }}),						
						new NotificationOpen({message: "Document added", config: 'success'})
					]),
					catchError(err => of(new NotificationOpen({message: err.statusText, config: 'failure'})))
				)
		)
	);



	constructor(
		private actions$: Actions,
		private documentService: DefaultService) {
	}
		/**
		 * You inject an optional Scheduler that will be undefined
		 * in normal application usage, but its injected here so that you can mock out
		 * during testing using the RxJS TestScheduler for simulating passages of time.
		 */

}
