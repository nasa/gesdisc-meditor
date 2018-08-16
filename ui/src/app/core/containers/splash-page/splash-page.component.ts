import { Component, OnInit } from '@angular/core';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';
import { Observable } from 'rxjs/Observable';

import { Store, select } from '@ngrx/store';

import * as fromApp from '../../../store';

@Component({
	selector: 'med-splash-page',
	templateUrl: './splash-page.component.html',
	styleUrls: ['./splash-page.component.css']
})
export class SplashPageComponent implements OnInit{

	models$: Observable<ModelCatalogEntry[]>;
	adminModels$: Observable<ModelCatalogEntry[]>;

	constructor(
		private store: Store<fromApp.AppState>
	) {
		this.models$ = store.pipe(select(fromApp.getNonAdminModels));
		this.adminModels$ = store.pipe(select(fromApp.getAdminModels));
	}

	ngOnInit () {			
    localStorage.clear();
  	this.store.dispatch(new fromApp.LoadModels());
	}

	goToSearchPage(event: any) {
		this.store.dispatch(new fromApp.SelectModel(event.name));
		this.store.dispatch(new fromApp.LoadSelectedModel(event.name));
		this.store.dispatch(new fromApp.Go({path: ['/search'], query: { model: event.name}}))
	}

}
