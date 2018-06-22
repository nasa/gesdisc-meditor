import { Component, ChangeDetectionStrategy, OnInit , ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

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

import { FormControl, FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Comment } from '../../comments/models/comment';

@Component({
	selector: 'med-docedit-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './docedit-page.component.html',
	styles: [
	`
		.comment-btn {
			background-color: blue;
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
			margin-left: 20px;
			margin-top: 10px;
			width: 90%;
		}

		.reply-form-field {
			width: 100%;
		}
	`,
	],
})
export class DocEditPageComponent implements OnInit {

	document$: Observable<Document | Model>;
	model$: Observable<Model>;
	history$: Observable<DocHistory[]>;
	selectedHistory$: Observable<string>;
	routeParams: any;
	@ViewChild('sidenav') sidenav: MatSidenav;

  reason = '';

  comments = [];
  commentForm: FormGroup;
  author:string='';
  comment: Comment;

  close() {
    this.sidenav.close();
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

  onFormSubmit(form: any) {
  	// let comment;
  	// comment = {
  	// 	'author': form.author,
  	// 	'text': form.text,
  	// 	'_parentId': null
  	// }
  }

	ngOnInit() {
		this.history$ = this.documentStore.pipe(select(fromDocument.selectAllHistory));
		this.selectedHistory$ = this.documentStore.pipe(select(fromDocument.getCurrentHistoryItem));
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
		this.openSnackBar('Document added', 'OK!');
	}

}
