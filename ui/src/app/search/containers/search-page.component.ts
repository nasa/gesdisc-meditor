import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import * as fromSearch from '../store';
import * as fromApp from '../../store';
import { Store, select } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { DocCatalogEntry } from '../../service/model/docCatalogEntry';
import { Router, ActivatedRoute, Params } from '@angular/router';

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
		private store: Store<fromApp.AppState>,
		//private rootStore: Store<fromApp.AppState>,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.models$ = store.pipe(select(fromApp.getNonAdminModels));
		this.selectedModel$ = store.pipe(select(fromApp.selectCurrentModel));
		this.results$ = store.pipe(select(fromSearch.selectAllResults));
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
		this.store.dispatch(new fromApp.SelectModel(type));
		this.store.dispatch(new fromApp.LoadSelectedModel(type));
	}

	loadSearchResults(type: any) {
		this.store.dispatch(new fromSearch.Search(type));
	}

	selectAndChange(event: any) {
		this.selectModel(event);
		this.changeQueryByType(event);
	}

	changeQueryByType(type: any) {
		this.router.navigate(['.'], { relativeTo: this.route, queryParams: { model: type }});
	}

	searchChanged(event: string) {
		this.filteredResults$ = this.results$.pipe(map(document => document.filter(doc => doc.title.search(new RegExp(event, "i")) != -1)))
	}

	addNewDocument() {
		this.router.navigate(['/document/edit'], {queryParams: { new: true, model: this.params['model'] }});
	}

}
