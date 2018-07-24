import { Component } from '@angular/core';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { Store, select } from '@ngrx/store';

import * as fromModel from '../../../reducers';


@Component({
	selector: 'med-splash-page',
	templateUrl: './splash-page.component.html',
	styleUrls: ['./splash-page.component.css']
})
export class SplashPageComponent {

	models$: Observable<ModelCatalogEntry[]>;
	adminModels$: Observable<ModelCatalogEntry[]>;

	constructor(
		private store: Store<fromModel.State>,
		private router: Router
	) {
		this.models$ = store.pipe(select(fromModel.getNonAdminModels));
		this.adminModels$ = store.pipe(select(fromModel.getAdminModels));
	}

	goToSearchPage(event: any) {
		this.router.navigate(['/search'], {queryParams: { model: event.name }});
	}

}
