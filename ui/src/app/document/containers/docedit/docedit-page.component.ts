import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { Store, Select } from '@ngxs/store';
import { ModelState } from 'app/store/model/model.state';
import { Document, DocHistory, Model } from 'app/service/model/models';
import { Observable } from 'rxjs/Observable';
import {
	UpdateCurrentDocument,
	GetCurrentDocumentHistory,
	GetCurrentDocumentVersion,
	UpdateDocumentState
} from 'app/store/document/document.state';
import {
	UpdateWorkflowState
} from 'app/store/workflow/workflow.state';
import { Go } from 'app/store/router/router.state';
import { WorkflowState, AuthState, DocumentState } from 'app/store';
import { SetInitialState } from 'app/store/workflow/workflow.state';
import { SuccessNotificationOpen, ErrorNotificationOpen } from 'app/store/notification/notification.state';
import { Workflow, Edge } from 'app/service/model/models';

@Component({
	selector: 'med-docedit-page',
	templateUrl: './docedit-page.component.html',
	styleUrls: ['./docedit-page.component.css'],
})
export class DocEditPageComponent implements OnInit {

	@Select(ModelState.currentModel) model$: Observable<Model>;
	@Select(DocumentState.currentDocument) document$: Observable<Document>;
	@Select(DocumentState.currentDocumentHistory) history$: Observable<DocHistory>;
	@Select(DocumentState.currentDocumentVersion) version$: Observable<string>;
	@Select(WorkflowState.currentEdges) edges$: Observable<Edge[]>;
	@Select(WorkflowState.currentWorkflow) workflow$: Observable<Edge>;
	@Select(AuthState.userPrivileges) userPrivileges$: Observable<string[]>;

	@ViewChild('sidenav') sidenav: MatSidenav;

	modelName: string;
	readonlydoc = true;
	liveFormData: Document;
	isFormValid: boolean;

	constructor(private store: Store) {}

	ngOnInit() {
		this.model$.subscribe(model => {
			this.modelName = model.name;
		});
		this.workflow$.subscribe(workflow => {
			if (workflow) {
				this.document$.subscribe(document => {
					this.store.dispatch(new UpdateWorkflowState(document['x-meditor'].state));
				});
			}
		});
	}

	submitDocument(document: any) {
		this.store.dispatch(new UpdateCurrentDocument({ document }))
			.subscribe(
				this.onSubmitDocumentSuccess.bind(this, document),
				this.onSubmitDocumentError.bind(this)
			);
	}

	onSubmitDocumentSuccess(document: any) {
		this.store.dispatch(new SuccessNotificationOpen('Successfully updated document'));
	}

	onSubmitDocumentError() {
		this.store.dispatch(new ErrorNotificationOpen('Failed to update document, please review and try again.'));
	}

	showDocumentHistory() {
		this.store.dispatch(new GetCurrentDocumentHistory());
		this.sidenav.open();
	}

	loadVersion(version: string) {
		this.store.dispatch(new GetCurrentDocumentVersion({ version }));
		this.sidenav.close();
	}

	updateState(target: string) {
		this.store.dispatch(new UpdateDocumentState({ state: target }))
			.subscribe(
				this.onUpdateStatusSuccess.bind(this, document),
				this.onUpdateStatusError.bind(this)
			);
	}

	onUpdateStatusSuccess(document: any) {
		let routeParams = {
			path: '/search/',
			query: {
				model: this.modelName
			},
		};

		this.store.dispatch(new SuccessNotificationOpen('Document sent'));
		this.store.dispatch(new SetInitialState());
		this.store.dispatch(new Go(routeParams));
	}

	onUpdateStatusError() {
		this.store.dispatch(new ErrorNotificationOpen('Failed to change document state document, please review and try again.'));
	}

	isValid(event: boolean) {
		this.isFormValid = event;
	}

	liveData(event: Document) {
		this.liveFormData = event;
	}

	saveDocument() {
		this.submitDocument(this.liveFormData);
	}

}
