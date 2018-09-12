import { Component, OnInit } from '@angular/core';
import { ModelCatalogEntry, Model } from 'app/service/model/models';
import { Observable } from 'rxjs/Observable';

import { Store, Select } from '@ngxs/store';
import { ModelState } from 'app/store/model/model.state';
import { Go } from 'app/store/router/router.state';
import { AuthState, GetUser } from 'app/store/auth/auth.state';


@Component({
	selector: 'med-splash-page',
	templateUrl: './splash-page.component.html',
	styleUrls: ['./splash-page.component.css']
})
export class SplashPageComponent implements OnInit{

	@Select(ModelState.models) models$: Observable<ModelCatalogEntry[]>;
	@Select(ModelState.currentModel) model$: Observable<Model>;
	@Select(ModelState.categories) categories$: Observable<string[]>;
	@Select(AuthState.loggedIn) loggedIn$: Observable<boolean>;

	constructor(
		private store: Store
	) {}

	ngOnInit () {
		localStorage.clear();
		this.loggedIn$.subscribe(loggedIn => {
			if (!loggedIn) { this.store.dispatch(new GetUser()); }
		});
	}

	goToSearchPage(event: any) {
		this.store.dispatch(new Go({path: '/search', query: { model: event.name}}));
	}
}