import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { Router, ActivatedRoute, Params } from '@angular/router';
import * as fromDocument from '../reducers/document.reducer';
import * as fromRoot from '../../reducers';
import { Document } from '../../service/model/document';
import { Model } from '../../service/model/model';

import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as Documents from '../actions/document.actions';
import * as Models from '../../core/actions/model.actions';

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

	document$: Observable<Document | Model>;
	routeParams: any;

	constructor(
		private documentStore: Store<fromDocument.State>,
		private rootStore: Store<fromRoot.State>,
		private router: Router,
		private route: ActivatedRoute
	) {
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.routeParams = params;
			this.rootStore.dispatch(new Models.LoadSelectedModel(params.model));
			if (!params.new) {
				this.loadDocument(params);
			} else {
				this.createNewDocument();
			}

		});
	}

	loadDocument(params) {
		this.documentStore.dispatch(new Documents.Load(params));
		this.document$ = this.documentStore.pipe(select(fromDocument.getDocument));
	}

	createNewDocument() {
		this.document$ = this.rootStore.pipe(select(fromRoot.getCurrentModel));
	}

	submitDocument(data) {
		console.log(data);
		let extendedData = JSON.parse(JSON.stringify(data))
		extendedData['x-meditor'] = {
			'model': this.routeParams['model'],
		}
		this.documentStore.dispatch(new Documents.SubmitDocument(extendedData));
	}

}
