import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { JsonSchemaFormService } from '../json-schema-form.service';

@Component({
  selector: 'ckeditor-widget',
  template: `
    <ck-editor [(ngModel)]="content" name="editor" skin="moono-lisa" lang="en" [config]="config"> 
    </ck-editor>
    `
    // <div
    //   [class]="options?.htmlClass || ''">
    //   <label *ngIf="options?.title"
    //     [attr.for]="'control' + layoutNode?._id"
    //     [class]="options?.labelHtmlClass || ''"
    //     [style.display]="options?.notitle ? 'none' : ''"
    //     [innerHTML]="options?.title"></label>
    //   <textarea *ngIf="boundControl"
    //     [formControl]="formControl"
    //     [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
    //     [attr.maxlength]="options?.maxLength"
    //     [attr.minlength]="options?.minLength"
    //     [attr.pattern]="options?.pattern"
    //     [attr.placeholder]="options?.placeholder"
    //     [attr.readonly]="options?.readonly ? 'readonly' : null"
    //     [attr.required]="options?.required"
    //     [class]="options?.fieldHtmlClass || ''"
    //     [id]="'control' + layoutNode?._id"
    //     [name]="controlName"></textarea>
    //   <textarea *ngIf="!boundControl"
    //     [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
    //     [attr.maxlength]="options?.maxLength"
    //     [attr.minlength]="options?.minLength"
    //     [attr.pattern]="options?.pattern"
    //     [attr.placeholder]="options?.placeholder"
    //     [attr.readonly]="options?.readonly ? 'readonly' : null"
    //     [attr.required]="options?.required"
    //     [class]="options?.fieldHtmlClass || ''"
    //     [disabled]="controlDisabled"
    //     [id]="'control' + layoutNode?._id"
    //     [name]="controlName"
    //     [value]="controlValue"
    //     (input)="updateValue($event)">{{controlValue}}</textarea>
    // </div>,
})
export class CkeditorComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue: any;
  controlDisabled = false;
  boundControl = false;
  options: any;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];


  content = '<p>Hello <strong>World !</strong></p>';
  config = {
    // mathjaxlib
    mathJaxLib: '/assets/MathJax/MathJax.js?config=TeX-AMS_HTML',
    toolbarGroups: [
      { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
      { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
      { name: 'links' },
      { name: 'insert' },
      { name: 'forms' },
      { name: 'tools' },
      { name: 'document',
         groups: [ 'mode', 'document', 'doctools' ] },
      { name: 'others' },
      '/',
      { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
      { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
      { name: 'styles' },
      { name: 'colors' },
      { name: 'about' }
    ],

    // Remove some buttons provided by the standard plugins, which are
    // not needed in the Standard(s) toolbar.
    removeButtons: 'Underline',

    // Set the most common block elements.
    format_tags: 'p;h1;h2;h3;pre',

    // Simplify the dialog windows.
    removeDialogTabs: 'image:advanced;link:advanced',
    
    // support for uploading
    filebrowserUploadUrl: '/images/upload',
    filebrowserUploadMethod: 'form',
  }

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {};
    this.jsf.initializeControl(this);
  }

  updateValue(event) {
    this.jsf.updateValue(this, event.target.value);
  }
}
