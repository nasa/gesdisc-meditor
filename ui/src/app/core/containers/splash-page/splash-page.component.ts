import { Component } from '@angular/core';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { Store, select } from '@ngrx/store';

import * as fromModel from '../../../reducers';


@Component({
	selector: 'med-splash-page',
	template: `
		<mat-card>
			<mat-card-title  style="text-align: center; color:gray;">
				Select a content type to edit
			</mat-card-title>
			<mat-card-content fxLayout="row wrap" fxLayoutAlign="center center">
				<med-model-button
					style="margin:10px"
					*ngFor="let model of models$ | async"
					[model]="model"
					(goToSearch)="goToSearchPage($event)">
				</med-model-button>
			</mat-card-content>
		</mat-card>
	`
})
export class SplashPageComponent {

	models$: Observable<ModelCatalogEntry[]>;

	constructor(
		private store: Store<fromModel.State>,
		private router: Router
	) {
		this.models$ = store.pipe(select(fromModel.getAllModels));
	}

	goToSearchPage(event: any) {
		this.router.navigate(['/search'], {queryParams: { model: event.name }});
	}

}
