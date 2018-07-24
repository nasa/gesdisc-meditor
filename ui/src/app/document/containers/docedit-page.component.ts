import { Component, ChangeDetectionStrategy, OnInit , ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { ActivatedRoute, Params } from '@angular/router';
import * as fromDocument from '../reducers';
import * as fromRoot from '../../state/app.state';
import { Document } from '../../service/model/document';
import { DocHistory } from '../../service/model/docHistory';
import { Model } from '../../service/model/model';

import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';


import * as Documents from '../actions/document.actions';
import * as History from '../actions/history.actions';
import * as Comments from '../../comments/actions/comments.actions';
import * as Models from '../../core/actions/model.actions';

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
	comments$: Observable<any>;
	routeParams: any;
	showResolved: boolean = false;
	showHistory: boolean = false;
	@ViewChild('sidenav') sidenav: MatSidenav;


	showForm: boolean = false;
  commentText: string = '';

  close() {
    this.sidenav.close();
    this.showForm = false;
  }


	constructor(
		private documentStore: Store<fromDocument.DocumentDataState>,
		private rootStore: Store<fromRoot.State>,
		private route: ActivatedRoute
	) {
	}

	ngOnInit() {
		this.history$ = this.documentStore.pipe(select(fromDocument.selectAllHistory));
		this.selectedHistory$ = this.documentStore.pipe(select(fromDocument.getCurrentHistoryItem));
		this.comments$ = this.documentStore.pipe(select(fromDocument.selectAllComments));
		this.route.queryParams.subscribe((params: Params) => {
			this.routeParams = params;
			this.rootStore.dispatch(new Models.LoadSelectedModel(params.model));
			this.model$ = this.rootStore.pipe(select(fromRoot.getCurrentModel));
			if (!params.new) {
				this.loadDocument(params);
			} else {
				this.createNewDocument();
			}

		});
	}

	loadDocument(params: any) {
		this.documentStore.dispatch(new Documents.Load(params));
		this.documentStore.dispatch(new History.Load(params));
		this.documentStore.dispatch(new Comments.Load(params['title']));
		this.document$ = this.documentStore.pipe(select(fromDocument.getDocument));
	}

	loadVersion(event: string) {
		let newParams = Object.assign({}, this.routeParams);
		newParams.version = event;
		this.documentStore.dispatch(new History.SetSelectedHistoryItem(event));
		this.documentStore.dispatch(new Documents.Load(newParams));
	}

	createNewDocument() {
		this.document$ = this.model$;
	}

	submitDocument(data: any) {
		let extendedData = JSON.parse(JSON.stringify(data))
		extendedData['x-meditor'] = {
			'model': this.routeParams['model'],
		}
		this.documentStore.dispatch(new Documents.SubmitDocument(extendedData));
		this.documentStore.dispatch(new History.Load(this.routeParams));
	}

	toggleForm() {
		this.showForm = !this.showForm;
		this.commentText = '';
	}

	toggleHistory() {
		this.showHistory = !this.showHistory;
	}

	resolveComment(_id: string) {
		this.documentStore.dispatch(new Comments.ResolveComment(_id))
	}

	submitComment(text?: string, parentId?: string) {
		let commentData = {
			'text': text || this.commentText,
			'documentId': this.routeParams['title'],
			'resolved': false,
			'parentId': parentId || 'root'
		};
		this.documentStore.dispatch(new Comments.SubmitComment(commentData));
		if (!parentId) this.toggleForm();
		this.documentStore.dispatch(new Comments.Load(this.routeParams['title']));
	}

	toggleResolvedComments() {
		this.showResolved = !this.showResolved;
	}

}
