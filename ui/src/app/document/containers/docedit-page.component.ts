import { Component, ChangeDetectionStrategy, OnInit , ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { ActivatedRoute, Params } from '@angular/router';
import * as fromDocument from '../store';
import * as fromApp from '../../store';
import { Document } from '../../service/model/document';
import { DocHistory } from '../../service/model/docHistory';
import { Model } from '../../service/model/model';

import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'med-docedit-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './docedit-page.component.html',
	styleUrls: ['./docedit-page.component.css'],
})
export class DocEditPageComponent implements OnInit {

	document$: Observable<Document | Model>;
	model$: Observable<Model>;
	history$: Observable<DocHistory[]>;
	selectedHistory$: Observable<string>;
	routeParams: any;
	showHistory: boolean = false;
	@ViewChild('sidenav') sidenav: MatSidenav;

  close() {
    this.sidenav.close();
  }

	constructor(
		private documentStore: Store<fromDocument.DocumentDataState>,
		private rootStore: Store<fromApp.AppState>,
		private route: ActivatedRoute
	) {
	}

	ngOnInit() {
		this.history$ = this.documentStore.pipe(select(fromDocument.selectAllHistory));
		this.selectedHistory$ = this.documentStore.pipe(select(fromDocument.getCurrentHistoryItem));
		this.route.queryParams.subscribe((params: Params) => {
			this.routeParams = params;
			this.rootStore.dispatch(new fromApp.LoadSelectedModel(params.model));
			this.model$ = this.rootStore.pipe(select(fromApp.getCurrentModel));
			if (!params.new) {
				this.loadDocument(params);
			} else {
				this.createNewDocument();
			}

		});
	}

	loadDocument(params: any) {
		this.documentStore.dispatch(new fromDocument.LoadDocument(params));
		this.documentStore.dispatch(new fromDocument.LoadHistory(params));
		this.document$ = this.documentStore.pipe(select(fromDocument.getDocument));
	}

	loadVersion(event: string) {
		let newParams = Object.assign({}, this.routeParams);
		newParams.version = event;
		this.documentStore.dispatch(new fromDocument.SetSelectedHistoryItem(event));
		this.documentStore.dispatch(new fromDocument.LoadDocument(newParams));
	}

	createNewDocument() {
		this.document$ = this.model$;
	}

	submitDocument(data: any) {
		let extendedData = JSON.parse(JSON.stringify(data))
		extendedData['x-meditor'] = {
			'model': this.routeParams['model'],
		}
		this.documentStore.dispatch(new fromDocument.SubmitDocument(extendedData));
		this.documentStore.dispatch(new fromDocument.LoadHistory(this.routeParams));
	}

	toggleHistory() {
		this.showHistory = !this.showHistory;
	}
}
