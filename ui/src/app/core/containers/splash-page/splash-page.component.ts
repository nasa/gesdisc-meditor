import { Component, OnInit } from '@angular/core';
import { ModelCatalogEntry, Model } from 'app/service/model/models';
import { Observable } from 'rxjs/Observable';

import { Store, Select } from '@ngxs/store';
import { ModelState } from 'app/store/model/model.state';

@Component({
	selector: 'med-splash-page',
	templateUrl: './splash-page.component.html',
	styleUrls: ['./splash-page.component.css']
})
export class SplashPageComponent implements OnInit{

	@Select(ModelState.models) models$: Observable<ModelCatalogEntry[]>;
	@Select(ModelState.currentModel) model$: Observable<Model>;
	@Select(ModelState.categories) categories$: Observable<string[]>;

	// models$: Observable<ModelCatalogEntry[]>;
	// currentModel$: Observable<string>;
	// categories$: Observable<string[]>;
	// modelName: string;

	constructor(
		private store: Store
	) {		
	}

	ngOnInit () {	
		localStorage.clear();		
		// this.store.dispatch(new fromApp.LoadModels());		
		// this.loggedIn$.subscribe(status => {
		// 	if (!status) { 
		// 		this.store.dispatch(new fromAuth.GetUser());
		// 	} 
		// })		
		// this.currentModel$.subscribe(model => { 
		// 	this.modelName = model;
		// })
	}

	goToSearchPage(event: any) {		
		// if (this.modelName !== event.name) {
		// 	this.store.dispatch(new fromApp.SelectModel(event.name));
		// 	this.store.dispatch(new fromApp.LoadSelectedModel(event.name));
		// }
		//this.store.dispatch(new Go({path: ['/search'], query: { model: event.name}}))
	}
}