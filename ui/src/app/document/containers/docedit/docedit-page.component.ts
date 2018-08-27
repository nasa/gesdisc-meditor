import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { Store, Select } from '@ngxs/store';
import { FetchDocument, DocumentState } from '../../../store/document/document.state';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'med-docedit-page',
	templateUrl: './docedit-page.component.html',
	styleUrls: ['./docedit-page.component.css'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocEditPageComponent {

	@Select(DocumentState) document$: Observable<Document>;

	constructor(
		private store: Store,
		private route: ActivatedRoute, 
	) {}

	ngOnInit() {
		this.store.dispatch(new FetchDocument(this.route.snapshot.queryParams))
	}

}

/*
import * as fromDocument from '../../store';
import * as fromApp from '../../../store';
import { Document } from '../../../service/model/document';
import { DocHistory } from '../../../service/model/docHistory';
import { Model } from '../../../service/model/model';


	documentTitle: string;
	modelName: string;
	titleProperty: string;
	model$: Observable<Model>;
	history$: Observable<DocHistory[]>;
	selectedHistory$: Observable<string>;
	showHistory: boolean = false;
	historyLoaded: boolean = false;
	@ViewChild('sidenav') sidenav: MatSidenav;

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
				this.documentTitle = document.doc[this.titleProperty];				
			}
		});		
		this.store.dispatch(new fromDocument.LoadHistory({model: this.modelName, title: this.documentTitle}));
	}

	loadVersion(event: string) {
		this.store.dispatch(new fromDocument.LoadVersion({model: this.modelName, title: this.documentTitle, version: event}));				
		this.store.dispatch(new fromDocument.SetSelectedHistoryItem(event));
		this.closeSidenav();
	}

	submitDocument(data: any) {
		data['x-meditor'] = {
			model: this.modelName
		};
		this.store.dispatch(new fromDocument.SubmitDocument(data));
		this.store.dispatch(new fromDocument.LoadHistory({model: this.modelName, title: this.documentTitle}));
	}

	toggleHistory() {	
		if(!this.historyLoaded) { 
			this.store.dispatch(new fromDocument.LoadHistory({model: this.modelName, title: this.documentTitle}));
			this.historyLoaded = true;
		}	
		this.showHistory = !this.showHistory;
	}

	closeSidenav() {
		this.sidenav.close();
	}

*/
