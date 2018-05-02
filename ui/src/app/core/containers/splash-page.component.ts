import { Component } from '@angular/core';
import { Model } from '../../service/model/model';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { Store, select } from '@ngrx/store';

import * as fromModel from '../../reducers';


@Component({
	selector: 'med-splash-page',
	template: `
		<div fxFill fxLayout="row">
			<div
				fxFlex.gt-md="calc((100%-600px)/2)"
				fxFlex="calc((100%/3)-1%)"
				fxFlex.xs="calc((100%-200px)/2)">
			</div>
			<div
				fxFlex.gt-md="600px"
				fxFlex="calc((100%/3)+2%)"
				fxFlex.xs="200px"
				fxLayout="column">
					<div
						fxFlex.gt-md="calc(30%-64px)"
						fxFlex.md="calc(15%-64px)"
						fxFlex.sm="calc((15%/2)-64px)"
						fxFlex.xs="calc((15%/4)-64px)">
					</div>
					<mat-card>
						<mat-card-title  style="text-align: left; color:gray;">
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
					<div
						fxFlex="calc(30%+64px)">
					</div>
			</div>
			<div
				fxFlex.gt-md="calc((100%-600px)/2)"
				fxFlex="calc((100%/3)-1%)"
				fxFlex.xs="calc((100%-200px)/2)">
			</div>
		</div>
	`
})
export class SplashPageComponent {

	models$: Observable<Model[]>;

	constructor(
		private store: Store<fromModel.State>,
		private router: Router
	) {
		this.models$ = store.pipe(select(fromModel.getAllModels));
	}

	goToSearchPage(event) {
		this.router.navigate(['/search'], {queryParams: { byType: event.name }});
	}

}
