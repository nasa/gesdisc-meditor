import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import * as _ from 'underscore';

@Component({
	selector: 'med-document-edit',
	templateUrl: './document-edit.component.html',
	styleUrls: ['./document-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
      if (this.layout && this.layout.findIndex(item => item.type === 'section') > -1) {
        this.expandAll = true;
      }
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
  expandAll: boolean;

	ngOnInit() {

	}

	onChanges(data: any) {
		this.liveData.emit(data);
	}

	isFormValid(isvalid: boolean): void {
		this.isValid.emit(isvalid);
	}

	validationErrors(data: any): void {
		this.formValidationErrors = data;
	}

  toggleAllSections() {
    this.expandAll = !this.expandAll;
    let newlayout = this.layout.slice(0);
    newlayout.forEach(item => { 
      if (item.type === 'section' && item.expandable === true) { 
        item.expanded = !this.expandAll; 
      } 
    });
    this.layout = newlayout;
  }

}
