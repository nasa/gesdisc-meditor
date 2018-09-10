import { Component, ChangeDetectionStrategy, OnInit , ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

import * as fromDocument from '../../store';
import * as fromApp from '../../../store';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { DocHistory, Model, Document } from 'src/app/service/model/models';

@Component({
	selector: 'med-docedit-page',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './docedit-page.component.html',
	styleUrls: ['./docedit-page.component.css'],
})
export class DocEditPageComponent implements OnInit {

	document$: Observable<Document>;
	documentTitle: string;
	modelName: string;
	titleProperty: string;
	model$: Observable<Model>;
	history$: Observable<DocHistory[]>;
	selectedHistory$: Observable<string>;
	showHistory: boolean = false;
	historyLoaded: boolean = false;
	@ViewChild('sidenav') sidenav: MatSidenav;
	
	open() {
    this.sidenav.open();
	}
	
	close() {
		this.sidenav.close();
		this.showHistory = false;
	}

	constructor(		
		private store: Store<fromApp.AppState>
	) {
	}

	ngOnInit() {	
		this.document$ = this.store.pipe(select(fromDocument.getDocument));
		this.model$ = this.store.pipe(select(fromApp.getCurrentModel));
		this.history$ = this.store.pipe(select(fromDocument.selectAllHistory));
		this.selectedHistory$ = this.store.pipe(select(fromDocument.getCurrentHistoryItem));
		this.model$.subscribe(model => {
			this.modelName = model.name;
			this.titleProperty = model.titleProperty || 'title';
		});
		this.document$.subscribe(document => {
			if(document.doc) {
				this.documentTitle = document.doc[this.titleProperty as any];				
			}
		});		
		// this.store.dispatch(new fromDocument.LoadHistory({model: this.modelName, title: this.documentTitle}));
	}

	loadVersion(event: string) {
		this.store.dispatch(new fromDocument.LoadVersion({model: this.modelName, title: this.documentTitle, version: event}));				
		this.store.dispatch(new fromDocument.SetSelectedHistoryItem(event));
		this.close();
	}

	submitDocument(data: any) {
		data['x-meditor'] = {
			model: this.modelName
		};
		data.title = this.documentTitle;
		this.store.dispatch(new fromDocument.SubmitDocument(data));
		this.store.dispatch(new fromDocument.LoadHistory({model: this.modelName, title: this.documentTitle}));
	}

	toggleHistory() {	
		this.showHistory ? this.close() : this.open();
		if(!this.historyLoaded) { 
			this.store.dispatch(new fromDocument.LoadHistory({model: this.modelName, title: this.documentTitle}));
			this.historyLoaded = true;
		}	
	}
}
