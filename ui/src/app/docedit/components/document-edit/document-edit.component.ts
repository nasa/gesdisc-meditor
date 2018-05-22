import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'med-document-edit',
  templateUrl: './document-edit.component.html',
  styleUrls: ['./document-edit.component.css']
})

export class DocumentEditComponent implements OnInit {


	@Input()
  set document(document: any) {
    if(document.document.schema) {
    	let schemaString = document.document.schema.replace('\'', '');
	    this.schema = JSON.parse(schemaString).properties;
	    this.data = document.document.doc;
    }
  }

	@Input() customWidgets: any;

	selectedFramework = "material-design";
	jsonFormOptions = {};
	schema =  {};
	data = {};
	layout = [
		"abstract",
		"expiration",
		"start",
		"severity",
		// "body"
		{ "key": "body", "widget" : "ckeditor" }
	];


	submittedFormData = {};
	liveFormData = {};
	formValidationErrors = {};
	formIsValid: boolean;

  constructor() {
  }

  ngOnInit() {
  }

  onSubmit(data: any) {
    this.submittedFormData = data;
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
