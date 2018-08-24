import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'med-document-edit',
	templateUrl: './document-edit.component.html',
	styleUrls: ['./document-edit.component.css']
})

export class DocumentEditComponent implements OnInit {

	@Input()
	set document(document: any) {
		if(document.schema) {
			let schemaString = document.schema.replace('\'', '');
			this.schema = JSON.parse(schemaString);
		}

		if(document.layout) {
			let layoutString = document.layout.replace('\'', '');
			this.layout = JSON.parse(layoutString);
		}

		this.data = document.doc;
	}

	@Output() submitDocument = new EventEmitter<object>();

	selectedFramework = "material-design";
	jsonFormOptions = {};
	schema =  {};
	data = {};
	layout = undefined;
	defaultLayoutOptions = {
		fxLayoutGap: '20px',
	};

	submittedFormData = {};
	liveFormData = {};
	formValidationErrors = {};
	formIsValid: boolean;


	ngOnInit() {

	}

	onSubmit() {
		this.submitDocument.emit(this.liveFormData);
	}

	onChanges(data: any) {
		this.liveFormData = data;
	}

	isValid(isValid: boolean): void {
		this.formIsValid = isValid;
	}

	validationErrors(data: any): void {
		this.formValidationErrors = data;
	}

}
