import { Component } from '@angular/core';
import { ModelCatalogEntry } from '../../../service/model/modelCatalogEntry';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { Store, select } from '@ngrx/store';

import * as fromModel from '../../../reducers';


@Component({
	selector: 'med-splash-page',
	template: `
		<mat-card class="content-types-card">
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
		<mat-card class="admin-types-card">
			<mat-card-title  style="text-align: center; color:gray;">
				Admin Panel
			</mat-card-title>
			<mat-card-content fxLayout="row wrap" fxLayoutAlign="center center">
				<med-model-button
					style="margin:10px"
					*ngFor="let model of adminModels$ | async"
					[model]="model"
					(goToSearch)="goToSearchPage($event)">
				</med-model-button>
			</mat-card-content>
		</mat-card>
	`,
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
