import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'med-document-edit',
	templateUrl: './document-edit.component.html',
	styleUrls: ['./document-edit.component.css']
})

export class DocumentEditComponent implements OnInit {

	@Input()
	set document(document: any) {
		if (document.schema) {
			const schemaString = document.schema.replace('\'', '');
			this.schema = JSON.parse(schemaString);
		}

		if (document.layout) {
			const layoutString = document.layout.replace('\'', '');
			this.layout = JSON.parse(layoutString);
		}

		this.data = document.doc;
	}

	@Output() liveData = new EventEmitter<object>();
	@Output() isValid = new EventEmitter<boolean>();

	selectedFramework = "material-design";
	jsonFormOptions = {
		addSubmit: false
	};
	schema =  {};
	data = {};
	layout = undefined;
	defaultLayoutOptions = {
		fxLayoutGap: '50px',
	};

	submittedFormData = {};
	liveFormData = {};
	formValidationErrors = {};
	formIsValid: boolean;


	ngOnInit() {

	}

	// onSubmit() {
	// 	this.submitDocument.emit(this.liveFormData);
	// }

	onChanges(data: any) {
		// this.liveFormData = data;
		this.liveData.emit(data);
	}

	isFormValid(isvalid: boolean): void {
		// this.formIsValid = isvalid;
		this.isValid.emit(isvalid);
	}

	validationErrors(data: any): void {
		this.formValidationErrors = data;
	}

}
