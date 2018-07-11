import { Component, ChangeDetectionStrategy, OnInit , ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import { Router, ActivatedRoute, Params } from '@angular/router';
import * as fromDocument from '../reducers';
import * as fromRoot from '../../reducers';
import { Document } from '../../service/model/document';
import { DocHistory } from '../../service/model/docHistory';
import { Model } from '../../service/model/model';
import { Comment } from '../../service/model/comment';

import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { MatSnackBar } from '@angular/material';


import * as Documents from '../actions/document.actions';
import * as History from '../actions/history.actions';
import * as Comments from '../../comments/actions/comments.actions';
import * as Models from '../../core/actions/model.actions';

import { FormControl } from '@angular/forms';

@Component({
	selector: 'med-docedit-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './docedit-page.component.html',
	styles: [
	`
		.doc-edit-container {
			margin-top: 5px;
			margin-bottom: 5px;
		}

		.comment-sidenav-container {
			background-color: white;
		}

		.comment-sidenav {
			width: 30%;
		}

		.example-container {
		  display: flex;
		  flex-direction: column;
		}

		.reply-card {
			margin: 10px 0 5px 5px;
			width: calc(90% - 5px);
		}

		.reply-form-field {
			width: 100%;
		}

		.action-button {
			margin-left: 20px;
			margin-top: 10px;
			background-color: #03a9f4;
		}

		.new-comment-button,
		.close-sidenav-button,
		.resolved-sidenav-button {
			margin-left: 5px;
		}

		.new-comment-button {
			background-color: #03a9f4;
		}

		.resolved-sidenav-button {
			width: 150px;
			background-color: #3cb44b;
		}

		.mat-drawer {
			padding-bottom: 30px;
		}

	`,
	],
})
export class DocEditPageComponent implements OnInit {

	document$: Observable<Document | Model>;
	model$: Observable<Model>;
	history$: Observable<DocHistory[]>;
	selectedHistory$: Observable<string>;
	comments$: Observable<any>;
	routeParams: any;
	showResolved: boolean = false;
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
		private router: Router,
		private route: ActivatedRoute,
		public  snackBar: MatSnackBar
	) {
	}

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
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

	loadDocument(params) {
		this.documentStore.dispatch(new Documents.Load(params));
		this.documentStore.dispatch(new History.Load(params));
		this.documentStore.dispatch(new Comments.Load(params['title']));
		this.document$ = this.documentStore.pipe(select(fromDocument.getDocument));
	}

	loadVersion(event) {
		let newParams = Object.assign({}, this.routeParams);
		newParams.version = event;
		this.documentStore.dispatch(new History.SetSelectedHistoryItem(event));
		this.documentStore.dispatch(new Documents.Load(newParams));
	}

	createNewDocument() {
		this.document$ = this.model$;
	}

	submitDocument(data) {
		let extendedData = JSON.parse(JSON.stringify(data))
		extendedData['x-meditor'] = {
			'model': this.routeParams['model'],
		}
		this.documentStore.dispatch(new Documents.SubmitDocument(extendedData));
		this.documentStore.dispatch(new History.Load(this.routeParams));
		// this should be an action after submitdocumentcomplete
		this.openSnackBar('Document added', 'OK!');
	}

	toggleForm() {
		this.showForm = !this.showForm;
		this.commentText = '';
	}

	resolveComment(_id) {
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
