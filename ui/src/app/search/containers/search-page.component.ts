import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { map, tap, withLatestFrom } from 'rxjs/operators';
import * as _ from 'underscore';
import { Observable } from 'rxjs/Observable';
import { Store, Select } from '@ngxs/store';
import { GetModel, GetModelDocuments } from 'app/store/model/model.state';
import { UpdateWorkflowState } from 'app/store/workflow/workflow.state';
import { Go } from 'app/store/router/router.state';
import { ModelCatalogEntry, DocCatalogEntry, Edge } from 'app/service/model/models';
import { AuthState, ModelState, WorkflowState } from 'app/store';

@Component({
	selector: 'med-search-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './search-page.component.html',
	styles: [``],
})
export class SearchPageComponent implements OnInit {

	@Select(ModelState.models) models$: Observable<ModelCatalogEntry[]>;
	@Select(ModelState.currentModel) selectedModel$: Observable<ModelCatalogEntry>;
	@Select(ModelState.currentModelDocuments) selectedModelDocuments$: Observable<DocCatalogEntry[]>;
	@Select(AuthState.userPrivileges) userPrivileges$: Observable<string[]>;
	@Select(WorkflowState.currentEdges) currentEdges$: Observable<Edge[]>;

	filteredDocuments$: Observable<DocCatalogEntry[]>;
	selectedModelName: string;

	constructor(private store: Store) {}

	ngOnInit() {
		this.selectedModel$.subscribe(this.selectedModelChanged.bind(this));
		this.selectedModelDocuments$.subscribe(this.selectedModelDocumentsChanged.bind(this));
	}

	selectedModelChanged(model: ModelCatalogEntry) {
		if (this.selectedModelName === model.name) { return; }

		this.selectedModelName = model.name;
		this.store.dispatch(new GetModelDocuments());
	}

	selectedModelDocumentsChanged() {
		this.filteredDocuments$ = this.selectedModelDocuments$;
	}

	filterDocuments(event: string) {
		this.filteredDocuments$ = this.selectedModelDocuments$
			.pipe(map(this.filterDocumentsBySearchTerm.bind(this, event)));
	}

	filterDocumentsBySearchTerm(searchTerm: string, documents: DocCatalogEntry[]) {
		return documents.filter(this.documentContainSearchTerm.bind(this, searchTerm));
	}

	documentContainSearchTerm(searchTerm: string, document: DocCatalogEntry) {
		return document.title.search(new RegExp(searchTerm, 'i')) !== -1;
	}

	sortByChanged(event: string) {
		this.filteredDocuments$ = this.selectedModelDocuments$.pipe(
			map(this.sortDocumentsByDate.bind(this, event))
		);
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
		this.store.dispatch(new GetModel({ name: modelName }));
		this.store.dispatch(new Go({ path: '/search', query: { model: modelName}}));
	}

	addNewDocument() {
		this.store.dispatch(new Go({ path: '/document/new', query: { model: this.selectedModelName }}));
	}

	loadDocument(event: {title: string, state: string}) {
		this.store.dispatch(new UpdateWorkflowState(event.state));
		this.store.dispatch(new Go({ path: '/document/edit', query: { model: this.selectedModelName, title: event.title }}));
	}
}

