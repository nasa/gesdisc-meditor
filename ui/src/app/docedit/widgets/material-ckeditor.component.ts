// import { Component, Input, OnInit } from '@angular/core';
// import { AbstractControl } from '@angular/forms';

// import { JsonSchemaFormService } from 'angular2-json-schema-form';

// @Component({
// 	selector: 'material-ckeditor-widget',
// 	template:
// 		`
// 		<div [class]="options?.htmlClass || ''">
// 			<label *ngIf="options?.title"
// 				[attr.for]="'control' + layoutNode?._id"
// 				[class]="options?.labelHtmlClass || ''"
// 				[style.display]="options?.notitle ? 'none' : ''"
// 				[innerHTML]="options?.title"></label>
// 			<ck-editor (ngModelChange)="updateValue($event)" [(ngModel)]="controlValue" [name]="controlName" [config]="config">
// 			</ck-editor>
// 			 <button mat-mini-fab *ngIf="options?.comments" color="primary" (click)="commentsClick()"><mat-icon>comment</mat-icon></button>
// 		</div>
// 		`
// })
// export class MaterialCkeditorComponent implements OnInit {
// 	formControl: AbstractControl;
// 	controlName: string;
// 	controlValue: any;
// 	controlDisabled = false;
// 	boundControl = false;
// 	options: any;
// 	@Input() layoutNode: any;
// 	@Input() layoutIndex: number[];
// 	@Input() dataIndex: number[];

// 	config = {
// 		mathJaxLib: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS_HTML',
// 		toolbarGroups: [
// 			{ name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
// 			{ name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
// 			{ name: 'links' },
// 			{ name: 'insert' },
// 			{ name: 'forms' },
// 			{ name: 'tools' },
// 			{ name: 'document',
// 				 groups: [ 'mode', 'document', 'doctools' ] },
// 			{ name: 'others' },
// 			'/',
// 			{ name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
// 			{ name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
// 			{ name: 'styles' },
// 			{ name: 'colors' },
// 			{ name: 'about' }
// 		],

// 		// Remove some buttons provided by the standard plugins, which are
// 		// not needed in the Standard(s) toolbar.
// 		removeButtons: 'Underline',

// 		// Set the most common block elements.
// 		format_tags: 'p;h1;h2;h3;pre',

// 		// Simplify the dialog windows.
// 		removeDialogTabs: 'image:advanced;link:advanced',
// 		filebrowserBrowseUrl: '/browser/browse.php',
// 		filebrowserUploadUrl: '/uploader/upload.php'
// 	}

// 	constructor(
// 		private jsf: JsonSchemaFormService
// 	) { }

// 	ngOnInit() {
// 		this.options = this.layoutNode.options || {};
// 		this.jsf.initializeControl(this);
// 		if (!this.options.notitle && !this.options.description && this.options.placeholder) {
// 			this.options.description = this.options.placeholder;
// 		}
// 	}

// 	commentsClick() {
// 		console.log(this.layoutNode.dataPointer);
// 	}

// 	updateValue(event) {
// 		this.jsf.updateValue(this, event);
// 	}
// }
