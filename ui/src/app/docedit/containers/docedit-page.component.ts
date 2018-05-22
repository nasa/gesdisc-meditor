import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { MaterialCkeditorComponent } from '../widgets/material-ckeditor.component';

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
				<med-document-edit [document]="document$ | async" [customWidgets] = "customWidgets"></med-document-edit>
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

	customWidgets = {
	  ckeditor: MaterialCkeditorComponent,
	}

	constructor(
		private documentStore: Store<fromDocument.State>,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.document$ = documentStore.pipe(select(fromDocument.getDocument));
	}

	ngOnInit() {
		this.route.queryParams.subscribe((params: Params) => {
			this.loadDocument(params);
		});
	}

	loadDocument(params) {
		this.documentStore.dispatch(new Documents.Load(params));
	}

}
