import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import isEqual from 'lodash/isEqual' 		// lodash/isMatch does deep comparison, underscore/isMatch is shallow
import * as _ from 'underscore'
import { environment } from '../../../../environments/environment'

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

  @Input() readonly: boolean;

	@Output() liveData = new EventEmitter<object>();
	@Output() isValid = new EventEmitter<boolean>();
	@Output() isDirty = new EventEmitter<boolean>();

	selectedFramework = "material-design";
	jsonFormOptions = {
		addSubmit: false,
		imageUploadUrl: environment.IMAGE_UPLOAD_URL,
	};
	schema =  {};
	data: any;
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
		delete this.data.banTransitions;
		delete this.data._id;
		this.isDirty.emit(!isEqual(this.data, data));
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
    let that = this;
    this.toggleExpandable(newlayout, that)
    this.layout = newlayout;
  }

  toggleExpandable(node: any, context: any) {
    _.each(node, function(item: any) {
      if (item.expandable) { item.expanded = !context.expandAll }
      if (item.items) {
        _.each(item.items, function(i: any) {
          context.toggleExpandable(i.items, context)
        })
      }
    })
  }



}
