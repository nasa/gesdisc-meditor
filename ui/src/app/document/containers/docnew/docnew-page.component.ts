import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store, Select } from '@ngxs/store';
import { Model } from 'app/service/model/models';
import { ModelState, AuthState } from 'app/store';
import { CreateDocument } from 'app/store/document/document.state';
import { Go } from 'app/store/router/router.state';
import { SuccessNotificationOpen, ErrorNotificationOpen } from 'app/store/notification/notification.state';

@Component({
	selector: 'med-docnew-page',
	templateUrl: './docnew-page.component.html',
	styleUrls: ['./docnew-page.component.css']
})
export class DocNewPageComponent implements OnInit {

	@Select(ModelState.currentModel) model$: Observable<Model>;
	@Select(AuthState.userPrivileges) userPrivileges$: Observable<string[]>;

	modelName: string;
	titleProperty: string;
	liveFormData: Document;
	isFormValid: boolean;

	constructor(private store: Store) {}

	ngOnInit() {
		this.model$.subscribe((model: any) => {
			this.modelName = model.name;
			this.titleProperty = model.titleProperty;
		});
	}

	createDocument(document: any) {
		this.store.dispatch(new CreateDocument({ model: this.modelName, document }))
			.subscribe(
				this.onCreateDocumentSuccess.bind(this, document),
				this.onCreateDocumentError.bind(this)
			);
	}

	onCreateDocumentSuccess(document: any) {
		let routeParams = {
			path: '/document/edit',
			query: {
				model: this.modelName,
				title: document[this.titleProperty],
			},
		};

		this.store.dispatch(new SuccessNotificationOpen('Successfully created document'));
		this.store.dispatch(new Go(routeParams));
	}

	onCreateDocumentError() {
		this.store.dispatch(new ErrorNotificationOpen('Failed to create document, please review and try again.'));
	}

	isValid(event: boolean) {
		this.isFormValid = event;
	}

	liveData(event: Document) {
		this.liveFormData = event;
	}

	saveDocument() {
		this.createDocument(this.liveFormData);
	}

}
