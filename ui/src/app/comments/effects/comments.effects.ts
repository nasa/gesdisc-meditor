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
	CommentsActionTypes,
	CommentsActionsUnion,
	Load,
	LoadComplete,
	SubmitComment,
	SubmitCommentComplete,
	ResolveComment,
	ResolveCommentComplete,
	ClearComments
} from '../actions/comments.actions';
import { Comment } from '../../service/model/comment';

import { NotificationOpen } from '../../core/actions/notification.actions';

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
export class CommentsEffects {

	@Effect()
	search$: Observable<Action> = this.actions$.pipe(
		ofType<Load>(CommentsActionTypes.Load),
		map(action => action.payload),
		switchMap(title =>
			this.defaultService
				.getComments(title)
				.pipe(
					switchMap((comments: Comment[]) => [
						new ClearComments(),
						new LoadComplete(comments)
					]),
					catchError(err => of(new NotificationOpen({message: err.statusText, action: 'Fail'})))
				)
		)
	);

	@Effect()
	submit$: Observable<Action> = this.actions$.pipe(
		ofType<SubmitComment>(CommentsActionTypes.SubmitComment),
		map(action => action.payload),
		switchMap(payload =>
			this.defaultService
				.postComment(new Blob([JSON.stringify(payload)]))
				.pipe(
					map(res => new SubmitCommentComplete()),
					catchError(err => of(new NotificationOpen({message: err.statusText, action: 'Fail'})))
				)
		)
	);

	@Effect()
	resolve$: Observable<Action> = this.actions$.pipe(
		ofType<ResolveComment>(CommentsActionTypes.ResolveComment),
		map(action => action.payload),
		switchMap(payload =>
			this.defaultService
				.resolveComment(payload)
				.pipe(
					map(res => new ResolveCommentComplete(payload)),
					catchError(err => of(new NotificationOpen({message: err.statusText, action: 'Fail'})))
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
