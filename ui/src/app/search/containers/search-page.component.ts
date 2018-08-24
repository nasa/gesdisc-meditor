import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import * as fromSearch from '../store';
import * as fromApp from '../../store';
import { Store, select } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { DocCatalogEntry } from '../../service/model/docCatalogEntry';

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
	selectedModelName: string;
	results$: Observable<DocCatalogEntry[]>;
	filteredResults$: Observable<DocCatalogEntry[]>;

	constructor(
		private store: Store<fromApp.AppState>
	) {
		this.models$ = store.pipe(select(fromApp.getAllModels));
		this.selectedModel$ = store.pipe(select(fromApp.selectCurrentModel));
		this.results$ = store.pipe(select(fromSearch.selectAllResults));
	}

	ngOnInit() {
		this.selectedModel$.subscribe(model => {
			this.selectedModelName = model.name;
			this.store.dispatch(new fromSearch.Search(this.selectedModelName));
		})
		this.filteredResults$ = this.results$;
	}
	
	selectAndChange(event: any) {
		this.store.dispatch(new fromApp.SelectModel(event));
		this.store.dispatch(new fromApp.LoadSelectedModel(event));
		this.store.dispatch(new fromApp.Go({path: ['/search'], query: { model: event}}));
	}

	searchChanged(event: string) {
		this.filteredResults$ = this.results$.pipe(map(document => document.filter(doc => doc.title.search(new RegExp(event, "i")) != -1)))
	}

	addNewDocument() {
		this.store.dispatch(new fromApp.Go({path: ['/document/new'], query: { model: this.selectedModelName}}))
	}

}
