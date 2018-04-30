import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import * as fromContentTypes from '../../reducers';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { ContentType } from '../../models/content-type';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as ContentTypes from '../../core/actions/content-type.actions';


@Component({
	selector: 'med-search-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<med-search-bar
			[query]=""
			[contentTypes]="contentTypes$ | async"
			[selectedContentType]="selectedContentType$ | async"
			(selectionChanged)="select($event)">
		</med-search-bar>
		<med-search-result-list [results]="results$ | async"></med-search-result-list>
	`,
	styles: [
		`
		:host {
			text-align: center;
		}
	`,
	],
})
export class SearchPageComponent implements OnInit {
	contentTypes$: Observable<ContentType[]>;
	selectedContentType$: Observable<ContentType>;

	constructor(
		private store: Store<fromContentTypes.State>,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.contentTypes$ = store.pipe(select(fromContentTypes.getAllContentTypes));
		this.selectedContentType$ = store.pipe(select(fromContentTypes.selectCurrentContentType));

		// this.selected$.subscribe(p => {console.log(p)})
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.store.dispatch(new ContentTypes.SelectContentType(params['byType']));
		});
	}

	select(event) {
		this.store.dispatch(new ContentTypes.SelectContentType(event.value.name));
		this.changeQueryByType(event.value.name);
	}

	changeQueryByType(type) {
		this.router.navigate(['.'], { relativeTo: this.route, queryParams: { byType: type }});
	}

}
