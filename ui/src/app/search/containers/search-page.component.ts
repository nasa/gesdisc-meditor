import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import * as fromSearch from '../store';
import * as fromApp from '../../store';
//import * as fromUser from '../../auth/store';
import { Store, select } from '@ngrx/store';
import { map } from 'rxjs/operators';

import * as _ from 'underscore';
import { Observable } from 'rxjs/Observable';
import { ModelCatalogEntry } from '../../service/model/modelCatalogEntry';
import { Model } from '../../service/model/model';
import { DocCatalogEntry } from '../../service/model/docCatalogEntry';
import { Privilege, Edge } from '../../service/model/workflow';

@Component({
	selector: 'med-search-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './search-page.component.html',
	styles: [
		`

	`,
	],
})
export class SearchPageComponent implements OnInit {

	models$: Observable<ModelCatalogEntry[]>;
	selectedModel$: Observable<ModelCatalogEntry>;
	workflowLoaded$: Observable<boolean>;
	privileges$: Observable<Privilege[]>;
	results$: Observable<DocCatalogEntry[]>;
	//user$: Observable<any>;
	edge$: Observable<Edge>;
	filteredResults$: Observable<DocCatalogEntry[]>;

	selectedModelName: string;
	selectedModel: Model;
	userRoles: Array<string>;
	currentPrivileges: Array<Privilege>
	canAddNewShow: boolean = false;

	constructor(
		private store: Store<fromApp.AppState>) {
		this.models$ = store.pipe(select(fromApp.getAllModels));
		this.selectedModel$ = store.pipe(select(fromApp.selectCurrentModel));
		this.results$ = store.pipe(select(fromSearch.selectAllResults));
		//this.user$ = store.pipe(select(fromUser.getUser));
		this.edge$ = store.pipe(select(fromApp.selectInitialEdge));
		this.privileges$ = store.pipe(select(fromApp.selectCurrentNode));
		this.workflowLoaded$ = store.pipe(select(fromApp.selectWorkflowLoaded));
	}

	ngOnInit() {
		this.selectedModel$.subscribe(model => {
			this.selectedModelName = model.name;		
			this.store.dispatch(new fromSearch.Search(this.selectedModelName));			
		});			
		this.workflowLoaded$.subscribe(isLoaded =>{
			if(isLoaded) this.canAddNew()
		});
		this.filteredResults$ = this.results$;		
	}
	
	selectAndChange(event: any) {
		this.canAddNewShow = false;
		this.store.dispatch(new fromApp.LoadWorkflow());
		this.store.dispatch(new fromApp.SelectModel(event));
		this.store.dispatch(new fromApp.LoadSelectedModel(event));
		this.store.dispatch(new fromApp.Go({path: ['/search'], query: { model: event}}));
	}

	canAddNew() {
		let that = this;
		this.user$.subscribe(user => {
			this.userRoles = _.pluck(_.filter(user.roles, function(roles: any){ return roles.model == that.selectedModelName}), 'role');			
		});
		this.privileges$.subscribe(privileges => {
			this.currentPrivileges = privileges
		});
		_.each(this.userRoles, function(role) { 
			let userPrivileges =  _.findWhere(that.currentPrivileges, {"role": role});
			if(userPrivileges) {
				that.canAddNewShow = userPrivileges.privilege.includes('create_new')};
			});
	}

	searchChanged(event: string) {
		this.filteredResults$ = this.results$.pipe(map(document => document.filter(doc => doc.title.search(new RegExp(event, "i")) != -1)))
	}

	sortByChanged(event: string) {
		if (event == 'oldest') {
			this.filteredResults$ = this.results$.pipe(map(document => { 
				document.sort((a, b) => { 
					return a['x-meditor'].modifiedOn < b['x-meditor'].modifiedOn ? -1 : 1; 
				});
				return document;
			}));
		} else {
			this.filteredResults$ = this.results$.pipe(map(document => { 
				document.sort((a, b) => { 
					return a['x-meditor'].modifiedOn > b['x-meditor'].modifiedOn ? -1 : 1; 
				});
				return document;
			}));
		}
	}

	addNewDocument() {
		this.store.dispatch(new fromApp.SetCurrentEdge({role: 'test', source: '1' ,target: '2', label: '1-2'}));
		this.store.dispatch(new fromApp.Go({path: ['/document/new'], query: { model: this.selectedModelName}}))
	}

}
