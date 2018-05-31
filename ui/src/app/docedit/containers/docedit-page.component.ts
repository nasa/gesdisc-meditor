import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { Router, ActivatedRoute, Params } from '@angular/router';
import * as fromDocument from '../reducers';
import * as fromRoot from '../../reducers';
import { Document } from '../../service/model/document';
import { DocHistory } from '../../service/model/docHistory';
import { Model } from '../../service/model/model';

import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { MatSnackBar } from '@angular/material';


import * as Documents from '../actions/document.actions';
import * as History from '../actions/history.actions';
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
		<div fxFlex="2"></div>
		<div fxFlex="18">
			<med-doc-history
				[dochistory]="history$ | async"
				[selectedHistory]= "selectedHistory$ | async"
				(loadVersion)="loadVersion($event)"></med-doc-history>
		</div>
		<div fxFlex="5"></div>
	</div>
	`,
	styles: [
		`

	`,
	],
})
export class DocEditPageComponent implements OnInit {

	document$: Observable<Document | Model>;
	history$: Observable<DocHistory[]>;
	selectedHistory$: Observable<string>;
	routeParams: any;

	constructor(
		private documentStore: Store<fromDocument.DocumentDataState>,
		private rootStore: Store<fromRoot.State>,
		private router: Router,
		private route: ActivatedRoute,
		public  snackBar: MatSnackBar
	) {
	}

  openSnackBar(message: string, action: string) {
  	console.log('snackbar');
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

	ngOnInit() {
		this.history$ = this.documentStore.pipe(select(fromDocument.selectAllHistory));
		this.selectedHistory$ = this.documentStore.pipe(select(fromDocument.getCurrentHistoryItem));
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
		this.documentStore.dispatch(new History.Load(params));
		this.document$ = this.documentStore.pipe(select(fromDocument.getDocument));
	}

	loadVersion(event) {
		let newParams = Object.assign({}, this.routeParams);
		newParams.version = event;
		this.documentStore.dispatch(new History.SetSelectedHistoryItem(event));
		this.documentStore.dispatch(new Documents.Load(newParams));
	}

	createNewDocument() {
		this.document$ = this.rootStore.pipe(select(fromRoot.getCurrentModel));
	}

	submitDocument(data) {
		let extendedData = JSON.parse(JSON.stringify(data))
		extendedData['x-meditor'] = {
			'model': this.routeParams['model'],
		}
		this.documentStore.dispatch(new Documents.SubmitDocument(extendedData));
		this.documentStore.dispatch(new History.Load(this.routeParams));
		this.openSnackBar('Document added', 'OK!');
	}

}
