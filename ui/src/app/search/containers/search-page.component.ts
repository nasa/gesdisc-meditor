import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import * as fromRoot from '../../reducers';
import * as fromSearch from '../reducers'
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Model } from '../../service/model/model';
import { Document } from '../../service/model/document';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as Models from '../../core/actions/model.actions';
import * as Results from '../actions/result.actions';



@Component({
	selector: 'med-search-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<med-search-bar
			[query]=""
			[models]="models$ | async"
			[selectedModel]="selectedModel$ | async"
			(selectionChanged)="selectAndChange($event)">
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
		private rootStore: Store<fromRoot.State>,
		private searchStore: Store<fromSearch.State>,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.models$ = rootStore.pipe(select(fromRoot.getAllModels));
		this.selectedModel$ = rootStore.pipe(select(fromRoot.selectCurrentModel));
		this.results$ = searchStore.pipe(select(fromSearch.selectAllResults));

		// this.selected$.subscribe(p => {console.log(p)})
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.selectModel(params['byType']);
			this.loadSearchResults(params['byType']);
		});
	}

	selectModel(type: any) {
		this.rootStore.dispatch(new Models.SelectModel(type));
	}

	loadSearchResults(type: any) {
		this.searchStore.dispatch(new Results.Search(type));
	}

	selectAndChange(event: any) {
		this.selectModel(event.value.name);
		this.changeQueryByType(event.value.name);
	}

	changeQueryByType(type: any) {
		this.router.navigate(['.'], { relativeTo: this.route, queryParams: { byType: type }});
	}

}
