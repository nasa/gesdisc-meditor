import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { Store, Select } from '@ngxs/store';
import { GetDocument, SaveDocument, DocumentState } from 'app/store/document/document.state';
import { GetModel, ModelState } from 'app/store/model/model.state';
import { Document, DocHistory, Model } from 'app/service/model/models';
import { Observable } from 'rxjs/Observable';

@Component({
	selector: 'med-docedit-page',
	templateUrl: './docedit-page.component.html',
	styleUrls: ['./docedit-page.component.css'],
})
export class DocEditPageComponent {

	@Select(DocumentState.currentDocument) document$: Observable<Document>;
	@Select(ModelState.loading) loadingModel$: Observable<boolean>;
	@Select(ModelState.currentModel) model$: Observable<Model>;

	@ViewChild('sidenav') sidenav: MatSidenav;

	documentTitle: string;
	modelName: string;
	titleProperty: string;

	constructor(private store: Store, private route: ActivatedRoute,) {}

	ngOnInit(): void {
		this.modelName = this.route.snapshot.queryParams.model;
		this.documentTitle = this.route.snapshot.queryParams.title;

		this.model$.subscribe(this.modelChanged.bind(this));

		this.loadData();
	}

	loadData() {
		this.store.dispatch(new GetModel({ 
			name: this.modelName, 
		})).subscribe((store: any) => {
			this.store.dispatch(new GetDocument({
				model: this.modelName,
				title: this.documentTitle,
				titleProperty: this.titleProperty,
				reload: true,
			}));
		});
	}

	modelChanged(model: Model) {
		if (!model) return;
		this.titleProperty = model.titleProperty || 'title';
	}

	submitDocument(document: any) {
		this.store.dispatch(new SaveDocument({
			model: this.modelName,
			document,
		}))
	}

	closeSidenav() {
		this.sidenav.close();
	}

}

/*
import { DocHistory } from '../../../service/model/docHistory';

	history$: Observable<DocHistory[]>;
	selectedHistory$: Observable<string>;
	showHistory: boolean = false;
	historyLoaded: boolean = false;
	

	ngOnInit() {	
		this.history$ = this.store.pipe(select(fromDocument.selectAllHistory));
		this.selectedHistory$ = this.store.pipe(select(fromDocument.getCurrentHistoryItem));
		this.store.dispatch(new fromDocument.LoadHistory({model: this.modelName, title: this.documentTitle}));
	}

	loadVersion(event: string) {
		this.store.dispatch(new fromDocument.LoadVersion({model: this.modelName, title: this.documentTitle, version: event}));				
		this.store.dispatch(new fromDocument.SetSelectedHistoryItem(event));
		this.closeSidenav();
	}

	toggleHistory() {	
		if(!this.historyLoaded) { 
			this.store.dispatch(new fromDocument.LoadHistory({model: this.modelName, title: this.documentTitle}));
			this.historyLoaded = true;
		}	
		this.showHistory = !this.showHistory;
	}
*/
