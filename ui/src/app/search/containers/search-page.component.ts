import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { map, tap } from 'rxjs/operators';
import * as _ from 'underscore';
import { Observable } from 'rxjs/Observable';
import { Store, Select } from '@ngxs/store';
import { GetModel, GetModelDocuments } from 'app/store/model/model.state';
import { Go } from 'app/store/router/router.state';
import { ModelCatalogEntry, DocCatalogEntry } from 'app/service/model/models';
import { WorkflowState, AuthState, ModelState } from 'app/store/ngxs-index';
import { Privilege } from 'app/service';

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
	@Select(WorkflowState.currentNodePrivileges) currentPrivilege$: Observable<Privilege[]>;
	@Select(AuthState.user) user$: Observable<any>;

	filteredDocuments$: Observable<DocCatalogEntry[]>;
	selectedModelName: string;
	currentUserRoles: string[];
	privileges: string[] = [];

	constructor(private store: Store) {}

	ngOnInit() {
		this.selectedModel$.subscribe(this.selectedModelChanged.bind(this));
		this.selectedModelDocuments$.subscribe(this.selectedModelDocumentsChanged.bind(this));
		this.currentPrivilege$.subscribe(this.getPrivileges.bind(this));
	}

	selectedModelChanged(model: ModelCatalogEntry) {
		if (this.selectedModelName === model.name) { return; }

		this.selectedModelName = model.name;
		this.privileges = [];
		this.user$.subscribe(this.getUserRoles.bind(this));
		this.store.dispatch(new GetModelDocuments());
	}

	selectedModelDocumentsChanged() {
		this.filteredDocuments$ = this.selectedModelDocuments$;
	}

	getPrivileges(privilege: Privilege[]) {
		const that = this;
		if (privilege) {
			_.each(this.currentUserRoles, function(role) {
				that.privileges = _.union(that.privileges, _.findWhere(privilege, {'role': role}).privilege);
			});
		}
	}

	getUserRoles(user: any) {
		if (this.selectedModelName && user && user.roles) {
			this.currentUserRoles = _.pluck(user.roles.filter((role: any) => role.model === this.selectedModelName), 'role');
		} else {
			console.log('Couldn\'t get user roles');
		}
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
}

