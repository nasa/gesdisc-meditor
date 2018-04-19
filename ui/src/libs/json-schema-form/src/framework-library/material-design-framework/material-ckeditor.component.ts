import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { JsonSchemaFormService } from '../../json-schema-form.service';

@Component({
  selector: 'material-ckeditor-widget',
  template: 
      // <textarea matInput *ngIf="boundControl"
      //   [formControl]="formControl"
      //   [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
      //   [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
      //   [attr.maxlength]="options?.maxLength"
      //   [attr.minlength]="options?.minLength"
      //   [attr.pattern]="options?.pattern"
      //   [required]="options?.required"
      //   [id]="'control' + layoutNode?._id"
      //   [name]="controlName"
      //   [placeholder]="options?.notitle ? options?.placeholder : options?.title"
      //   [readonly]="options?.readonly ? 'readonly' : null"
      //   [style.width]="'100%'"
      //   (blur)="options.showErrors = true"></textarea>
      // <textarea  matInput *ngIf="!boundControl"
      //   [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
      //   [attr.list]="'control' + layoutNode?._id + 'Autocomplete'"
      //   [attr.maxlength]="options?.maxLength"
      //   [attr.minlength]="options?.minLength"
      //   [attr.pattern]="options?.pattern"
      //   [required]="options?.required"
      //   [disabled]="controlDisabled"
      //   [id]="'control' + layoutNode?._id"
      //   [name]="controlName"
      //   [placeholder]="options?.notitle ? options?.placeholder : options?.title"
      //   [readonly]="options?.readonly ? 'readonly' : null"
      //   [style.width]="'100%'"
      //   [value]="controlValue"
      //   (input)="updateValue($event)"
      //   (blur)="options.showErrors = true"></textarea>
  
    // <mat-form-field
    //   [class]="options?.htmlClass || ''"
    //   [floatPlaceholder]="options?.floatPlaceholder || (options?.notitle ? 'never' : 'auto')"
    //   [style.width]="'100%'">
    //   <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
    //     [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      `<div
      [class]="options?.htmlClass || ''">
        <label *ngIf="options?.title"
          [attr.for]="'control' + layoutNode?._id"
          [class]="options?.labelHtmlClass || ''"
          [style.display]="options?.notitle ? 'none' : ''"
          [innerHTML]="options?.title"></label>       
        <ck-editor (ngModelChange)="updateValue($event)" [(ngModel)]="controlValue" [name]="controlName" [config]="config"> 
        </ck-editor> 
         <button mat-mini-fab *ngIf="options?.comments" color="primary" (click)="commentsClick()"><mat-icon>comment</mat-icon></button>
      </div>
        `     
    //   <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
    //     [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
    //   <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
    //     align="end" [innerHTML]="options?.description"></mat-hint>
    // </mat-form-field>
    // <mat-error *ngIf="options?.showErrors && options?.errorMessage"
    //   [innerHTML]="options?.errorMessage"></mat-error>`,
  // styles: [`
  //   mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }
  //   ::ng-deep mat-form-field .mat-form-field-wrapper .mat-form-field-flex
  //     .mat-form-field-infix { width: initial; }
  // `],
})
export class MaterialCkeditorComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue: any;
  controlDisabled = false;
  boundControl = false;
  options: any;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

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
    filebrowserBrowseUrl: '/browser/browse.php',
    filebrowserUploadUrl: '/uploader/upload.php'
  }

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {};
    this.jsf.initializeControl(this);
    if (!this.options.notitle && !this.options.description && this.options.placeholder) {
      this.options.description = this.options.placeholder;
    }
  }

  commentsClick() {
    console.log(this.layoutNode.dataPointer);
  }

  updateValue(event) {
    this.jsf.updateValue(this, event);
  }
}
