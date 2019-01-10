import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import isMatch from 'lodash/isMatch' 		// lodash/isMatch does deep comparison, underscore/isMatch is shallow

@Component({
	selector: 'med-document-edit',
	templateUrl: './document-edit.component.html',
	styleUrls: ['./document-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DocumentEditComponent {

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
        this.showExpandButton = true;
        this.expandAll = true;
      }
		}

		this.data = document.doc;
	}

	@Output() liveData = new EventEmitter<object>();
	@Output() isValid = new EventEmitter<boolean>();
	@Output() isDirty = new EventEmitter<boolean>();

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
	formValidationErrors = {};
	formIsValid: boolean;
  expandAll: boolean;
	showExpandButton: boolean;

	onChanges(data: any) {
		this.isDirty.emit(!isMatch(this.data, data));
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
