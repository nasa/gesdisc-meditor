import { Component, ChangeDetectionStrategy } from '@angular/core';
import { map } from 'rxjs/operators';
import * as _ from 'underscore';
import { Observable } from 'rxjs/Observable';
import { Store, Select } from '@ngxs/store';
import { ModelState, GetModel, GetModelDocuments } from 'app/store/model/model.state';
import { Go } from 'app/store/router/router.state';
import { ModelCatalogEntry, DocCatalogEntry } from 'app/service/model/models';

@Component({
	selector: 'med-search-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './search-page.component.html',
	styles: [``],
})
export class SearchPageComponent {

	@Select(ModelState.models) models$: Observable<ModelCatalogEntry[]>;
	@Select(ModelState.currentModel) selectedModel$: Observable<ModelCatalogEntry>;
	@Select(ModelState.currentModelDocuments) selectedModelDocuments$: Observable<DocCatalogEntry[]>;

	filteredDocuments$: Observable<DocCatalogEntry[]>;
	selectedModelName: string;
	canAddNew: boolean = true;

	constructor(private store: Store){}

	ngOnInit() {
		this.selectedModel$.subscribe(this.selectedModelChanged.bind(this))
		this.selectedModelDocuments$.subscribe(this.selectedModelDocumentsChanged.bind(this))
	}

	selectedModelChanged(model: ModelCatalogEntry) {
		if (this.selectedModelName === model.name) return

		this.selectedModelName = model.name;
		this.store.dispatch(new GetModelDocuments());
	}

	selectedModelDocumentsChanged() {
		this.filteredDocuments$ = this.selectedModelDocuments$;
	}

	filterDocuments(event: string) {
		this.filteredDocuments$ = this.selectedModelDocuments$
			.pipe(map(this.filterDocumentsBySearchTerm.bind(this, event)))
	}

	filterDocumentsBySearchTerm(searchTerm: string, documents: DocCatalogEntry[]) {
		return documents.filter(this.documentContainSearchTerm.bind(this, searchTerm))
	}

	documentContainSearchTerm(searchTerm: string, document: DocCatalogEntry) {
		return document.title.search(new RegExp(searchTerm, "i")) !== -1;
	}

	sortByChanged(event: string) {
		this.filteredDocuments$ = this.selectedModelDocuments$.pipe(
			map(this.sortDocumentsByDate.bind(this, event))
		)
		
		/*
		if (event == 'oldest') {
			this.filteredDocuments$ = this.results$.pipe(map(document => { 
				document.sort((a, b) => { 
					
				});
				return document;
			}));
		} else {
			this.filteredDocuments$ = this.results$.pipe(map(document => { 
				document.sort((a, b) => { 
					
				});
				return document;
			}));
		}*/
	}

	sortDocumentsByDate(date: string, documents: DocCatalogEntry[]) {
		return documents.sort((a, b) => {
			if (date === 'oldest') {
				return a['x-meditor'].modifiedOn < b['x-meditor'].modifiedOn ? -1 : 1;
			} else {
				return a['x-meditor'].modifiedOn > b['x-meditor'].modifiedOn ? -1 : 1; 
			} 
		});
	}

	selectAndChange(modelName: any) {
		this.store.dispatch(new GetModel({ name: modelName }))
		this.store.dispatch(new Go({ path: '/search', query: { model: modelName}}));
	}

	addNewDocument() {
		this.store.dispatch(new Go({ path: '/document/new', query: { model: this.selectedModelName }}))
	}

}
