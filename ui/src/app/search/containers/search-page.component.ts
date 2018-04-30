import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import * as fromModel from '../../reducers';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Model } from '../../service/model/model';
import { Document } from '../../service/model/document';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as Models from '../../core/actions/model.actions';


@Component({
	selector: 'med-search-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<med-search-bar
			[query]=""
			[models]="models$ | async"
			[selectedModel]="selectedModel$ | async"
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
	models$: Observable<Model[]>;
	selectedModel$: Observable<Model>;
	results$: Observable<Document[]>;

	constructor(
		private store: Store<fromModel.State>,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.models$ = store.pipe(select(fromModel.getAllModels));
		this.selectedModel$ = store.pipe(select(fromModel.selectCurrentModel));

		// this.selected$.subscribe(p => {console.log(p)})
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.store.dispatch(new Models.SelectModel(params['byType']));
		});
	}

	select(event) {
		this.store.dispatch(new Models.SelectModel(event.value.name));
		this.changeQueryByType(event.value.name);
	}

	changeQueryByType(type) {
		this.router.navigate(['.'], { relativeTo: this.route, queryParams: { byType: type }});
	}

}
