import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import * as fromRoot from '../../reducers';
import * as fromSearch from '../reducers'
import { Store, select } from '@ngrx/store';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { Model } from '../../service/model/model';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { DocCatalogEntry } from '../../service/model/docCatalogEntry';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as Models from '../../core/actions/model.actions';
import * as Results from '../actions/result.actions';

@Component({
	selector: 'med-search-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `
		<med-search-bar
			[models]="models$ | async"
			[selectedModel]="selectedModel$ | async"
			(selectionChanged)="selectAndChange($event)"
			(searchChanged)="searchChanged($event)">
		</med-search-bar>
		<med-search-status
			[resultCount] = "(results$ | async)?.length"
			[filteredCount] = "(filteredResults$ | async)?.length"
			[modelName] = "(selectedModel$ | async)?.name"
			(addNew) = "addNewDocument()">
		</med-search-status>
		<med-search-result-list [results]="filteredResults$ | async" [model]="selectedModel$ | async"></med-search-result-list>
	`,
	styles: [
		`

	`,
	],
})
export class SearchPageComponent implements OnInit {

	models$: Observable<ModelCatalogEntry[]>;
	selectedModel$: Observable<ModelCatalogEntry>;
	results$: Observable<DocCatalogEntry[]>;
	filteredResults$: Observable<DocCatalogEntry[]>;
	params: any;

	constructor(
		private rootStore: Store<fromRoot.State>,
		private searchStore: Store<fromSearch.State>,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.models$ = rootStore.pipe(select(fromRoot.getAllModels));
		this.results$ = searchStore.pipe(select(fromSearch.selectAllResults));
		this.selectedModel$ = rootStore.pipe(select(fromRoot.selectCurrentModel));
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.params = params;
			this.selectModel(params['model']);
			this.loadSearchResults(params['model']);
		});
		this.filteredResults$ = this.results$;
	}

	selectModel(type: any) {
		this.rootStore.dispatch(new Models.SelectModel(type));
		this.rootStore.dispatch(new Models.LoadSelectedModel(type));
	}

	loadSearchResults(type: any) {
		this.searchStore.dispatch(new Results.Search(type));
	}

	selectAndChange(event: any) {
		this.selectModel(event);
		this.changeQueryByType(event);
	}

	changeQueryByType(type: any) {
		this.router.navigate(['.'], { relativeTo: this.route, queryParams: { model: type }});
	}

	searchChanged(event) {
		this.filteredResults$ = this.results$.pipe(map(document => document.filter(doc => doc.title.search(new RegExp(event, "i")) != -1)))
	}

	addNewDocument() {
		this.router.navigate(['/document/edit'], {queryParams: { new: true, model: this.params['model'] }});
	}

}
