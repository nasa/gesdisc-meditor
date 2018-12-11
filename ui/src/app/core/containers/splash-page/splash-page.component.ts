import { Component, OnInit } from '@angular/core';
import { ModelCatalogEntry } from 'app/service/model/models';
import { Observable } from 'rxjs/Observable';

import { Store, Select } from '@ngxs/store';
import { ModelState } from 'app/store/model/model.state';
import { Navigate } from '@ngxs/router-plugin';


@Component({
	selector: 'med-splash-page',
	templateUrl: './splash-page.component.html',
	styleUrls: ['./splash-page.component.css']
})
export class SplashPageComponent implements OnInit {

	@Select(ModelState.models) models$: Observable<ModelCatalogEntry[]>;
	@Select(ModelState.categories) categories$: Observable<string[]>;

	constructor(
		private store: Store
	) {}

	ngOnInit () {
		localStorage.clear();
	}

	goToSearchPage(event: any) {
		this.store.dispatch(new Navigate(['/search'], { model: event.name}));
	}

}
