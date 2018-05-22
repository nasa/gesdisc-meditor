import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { Router, ActivatedRoute, Params } from '@angular/router';
import * as fromDocument from '../reducers/document.reducer';
import { Document } from '../../service/model/document';

import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as Documents from '../actions/document.actions';

@Component({
	selector: 'med-docedit-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template:
	`<div fxLayout="row">
		<div fxFlex="5"></div>
		<mat-card fxFlex="70">
			<mat-card-content>
				<med-document-edit
					[document]="document$ | async"
					(submitDocument)="submitDocument($event)">
				</med-document-edit>
			</mat-card-content>
		</mat-card>
		<div fxFlex="5"></div>
		<mat-card fxFlex="15">
			<mat-card-content>
				History
			</mat-card-content>
		</mat-card>
	</div>
	`,
	styles: [
		`

	`,
	],
})
export class DocEditPageComponent implements OnInit {

	document$: Observable<Document>;
	routeParams: any;

	constructor(
		private documentStore: Store<fromDocument.State>,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.document$ = documentStore.pipe(select(fromDocument.getDocument));
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.routeParams = params;
			this.loadDocument(params);
		});
	}

	loadDocument(params) {
		this.documentStore.dispatch(new Documents.Load(params));
	}

	submitDocument(data) {
		let extendedData = JSON.parse(JSON.stringify(data))
		extendedData['x-meditor'] = {
			'model': this.routeParams['model'],
			//'modifiedOn' : Date.now()
		}
		this.documentStore.dispatch(new Documents.SubmitDocument(extendedData));
	}

}
