import { Component, OnInit } from '@angular/core';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

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
		private store: Store<fromApp.AppState>,
		private router: Router
	) {
		this.models$ = store.pipe(select(fromApp.getNonAdminModels));
		this.adminModels$ = store.pipe(select(fromApp.getAdminModels));
	}

	ngOnInit () {
  	this.store.dispatch(new fromApp.LoadModels());
	}

	goToSearchPage(event: any) {
		this.router.navigate(['/search'], {queryParams: { model: event.name }});
	}

}
