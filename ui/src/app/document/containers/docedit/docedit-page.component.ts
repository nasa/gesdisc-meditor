import { Component, ViewChild, OnInit, HostListener } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatSidenav } from "@angular/material/sidenav";
import { Store, Select } from "@ngxs/store";
import { ModelState } from "app/store/model/model.state";
import {
	Document,
	DocHistory,
	Model,
	Comment,
	Edge,
	User
} from "app/service/model/models";
import { Observable } from "rxjs/Observable";
import {
	UpdateCurrentDocument,
	GetDocument,
	GetCurrentDocumentHistory,
	GetCurrentDocumentVersion,
	GetCurrentDocumentComments,
	ResolveComment,
	SubmitComment,
	EditComment,
	UpdateDocumentState
} from "app/store/document/document.state";
import { UpdateWorkflowState } from "app/store/workflow/workflow.state";
import { Navigate } from "@ngxs/router-plugin";
import { WorkflowState, AuthState, DocumentState } from "app/store";
import { SetInitialState } from "app/store/workflow/workflow.state";
import {
	SuccessNotificationOpen,
	ErrorNotificationOpen
} from "app/store/notification/notification.state";
import { ComponentCanDeactivate } from "app/shared/guards/pending-changes.guard";

@Component({
	selector: "med-docedit-page",
	templateUrl: "./docedit-page.component.html",
	styleUrls: ["./docedit-page.component.css"]
})
export class DocEditPageComponent implements OnInit, ComponentCanDeactivate {
	@Select(ModelState.currentModel) model$: Observable<Model>;
	@Select(DocumentState.currentDocument) document$: Observable<Document>;
	@Select(DocumentState.currentDocumentHistory) history$: Observable<
		DocHistory[]
	>;
	@Select(DocumentState.currentDocumentVersion) version$: Observable<string>;
	@Select(DocumentState.currentDocumentComments) comments$: Observable<
		Comment[]
	>;
	@Select(DocumentState.currentCommentsCount) commentsCount$: Observable<
		number
	>;
	@Select(DocumentState.currentVersionsCount) versionsCount$: Observable<
		number
	>;
	@Select(WorkflowState.currentEdges) edges$: Observable<Edge[]>;
	@Select(WorkflowState.currentWorkflow) workflow$: Observable<Edge>;
	@Select(AuthState.userPrivileges) userPrivileges$: Observable<string[]>;
	@Select(AuthState.user) user$: Observable<User>;

	@ViewChild("sidenav") sidenav: MatSidenav;

	modelName: string;
	titleProperty: string;
	history: DocHistory[];
	versionFilter: Date = new Date();
	readonlydoc = true;
	liveFormData: Document;
	isFormValid: boolean = false;
	showHistory: boolean;
	showComments: boolean;
	dirty: boolean = false;

	constructor(private store: Store, private titleService: Title) {}

	ngOnInit() {
		this.model$.subscribe(model => {
			this.modelName = model.name;
			this.titleProperty = model.titleProperty;
		});
		this.history$.subscribe(history => {
			this.history = history;
		});
		this.workflow$.subscribe(workflow => {
			if (workflow) {
				this.document$.subscribe(document => {
					this.store.dispatch(
						new UpdateWorkflowState(document["x-meditor"].state)
					);
					this.titleService.setTitle(
						document.doc[this.titleProperty] +
							" | " +
							this.modelName +
							" | mEditor"
					);
				});
			}
		});
	}

	@HostListener("window:beforeunload")
	canDeactivate(): Observable<boolean> | boolean {
		return !this.dirty;
	}

	submitDocument(document: any) {
		this.store
			.dispatch(new UpdateCurrentDocument({ document }))
			.subscribe(
				this.onSubmitDocumentSuccess.bind(this, document),
				this.onSubmitDocumentError.bind(this)
			);
	}

	onSubmitDocumentSuccess(document: any) {
		let model = document["x-meditor"].model;
		let title = document[this.titleProperty];

		this.store.dispatch(new GetDocument({ model, title }));
		this.store.dispatch(
			new SuccessNotificationOpen("Successfully updated document")
		);
	}

	onSubmitDocumentError() {
		this.store.dispatch(
			new ErrorNotificationOpen(
				"Failed to update document, please review and try again."
			)
		);
	}

	showDocumentHistory() {
		this.store.dispatch(new GetCurrentDocumentHistory());
		this.showHistory = !this.showHistory;
		this.sidenav.open();
	}

	showDocumentComments() {
		this.store.dispatch(new GetCurrentDocumentComments());
		this.showComments = !this.showComments;
		this.sidenav.open();
	}

	resetSidenav() {
		this.showComments = false;
		this.showHistory = false;
	}

	loadVersion(version: string) {
		this.store.dispatch(new GetCurrentDocumentVersion({ version }));
		let versionIdx = this.history.findIndex(
			i => i.modifiedOn.toString() == version
		);
		if (versionIdx - 1 > -1) {
			this.versionFilter = this.history[versionIdx - 1].modifiedOn;
		} else {
			this.versionFilter = new Date();
		}
		this.sidenav.close();
	}

	updateState(target: string) {
		this.store
			.dispatch(new UpdateDocumentState({ state: target }))
			.subscribe(
				this.onUpdateStatusSuccess.bind(this, document),
				this.onUpdateStatusError.bind(this)
			);
	}

	onUpdateStatusSuccess(document: any) {
		this.store.dispatch(new SuccessNotificationOpen("Document sent"));
		this.store.dispatch(new SetInitialState());
		this.store.dispatch(new Navigate(["/search"], { model: this.modelName }));
	}

	onUpdateStatusError() {
		this.store.dispatch(
			new ErrorNotificationOpen(
				"Failed to change document state document, please review and try again."
			)
		);
	}

	isValid(event: boolean) {
		this.isFormValid = event;
	}

	isDirty(event: boolean) {
		this.dirty = event;
	}

	liveData(event: Document) {
		this.liveFormData = event;
	}

	saveDocument() {
		this.submitDocument(this.liveFormData);
	}

	resolveComment(id: string) {
		this.store.dispatch(new ResolveComment(id));
	}

	editComment(editedComment: any) {
		this.store.dispatch(new EditComment(editedComment));
	}

	submitComment(commentData: any) {
		this.store.dispatch(new SubmitComment(commentData));
	}
}
