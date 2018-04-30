import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { JsonSchemaFormService } from '../../json-schema-form.service';
import { buildTitleMap, isArray } from '../../shared';

@Component({
  selector: 'material-select-widget',
  template: `
    <mat-form-field
      [class]="options?.htmlClass || ''"
      [floatLabel]="options?.floatLabel || (options?.notitle ? 'never' : 'auto')"
      [style.width]="'100%'">
      <span matPrefix *ngIf="options?.prefix || options?.fieldAddonLeft"
        [innerHTML]="options?.prefix || options?.fieldAddonLeft"></span>
      <mat-select *ngIf="boundControl"
        [formControl]="formControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.name]="controlName"
        [id]="'control' + layoutNode?._id"
        [multiple]="options?.multiple"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        (blur)="options.showErrors = true"
        [(ngModel)]="selected">
        <mat-select-trigger *ngIf="selected">
          <span class="color-box" [style.background-color]="selected.hex"></span>
          <span>{{ selected.name }}</span>
          ({{ selected.hex }})
        </mat-select-trigger>
        <ng-template ngFor let-selectItem [ngForOf]="selectList">
          <mat-option
            [value]="selectItem">
            <span class="color-box" [style.background-color]="selectItem.hex"></span>
            <span>{{ selectItem.name }}</span>
          ({{ selectItem.hex }})
          </mat-option>          
        </ng-template>
      </mat-select>
      <mat-select *ngIf="!boundControl"
        [attr.aria-describedby]="'control' + layoutNode?._id + 'Status'"
        [attr.name]="controlName"
        [disabled]="controlDisabled || options?.readonly"
        [id]="'control' + layoutNode?._id"
        [multiple]="options?.multiple"
        [placeholder]="options?.notitle ? options?.placeholder : options?.title"
        [required]="options?.required"
        [style.width]="'100%'"
        [value]="controlValue"
        (blur)="options.showErrors = true"
        (change)="updateValue($event)"
        [(ngModel)]="selected">
        <mat-select-trigger *ngIf="selected">
          <span class="color-box" [style.background-color]="selected.hex"></span>
          <span>{{ selected.name }}</span>
          ({{ selected.hex }})
        </mat-select-trigger>
        <ng-template ngFor let-selectItem [ngForOf]="selectList">
          <mat-option
            [value]="selectItem">
            <span class="color-box" [style.background-color]="selectItem.hex"></span>
            <span>{{ selectItem.name }}</span>
          ({{ selectItem?.hex }})
          </mat-option>          
        </ng-template>
      </mat-select>
      <span matSuffix *ngIf="options?.suffix || options?.fieldAddonRight"
        [innerHTML]="options?.suffix || options?.fieldAddonRight"></span>
      <mat-hint *ngIf="options?.description && (!options?.showErrors || !options?.errorMessage)"
        align="end" [innerHTML]="options?.description"></mat-hint>
    </mat-form-field>
    <mat-error *ngIf="options?.showErrors && options?.errorMessage"
      [innerHTML]="options?.errorMessage"></mat-error>`,
  styles: [`
    mat-error { font-size: 75%; margin-top: -1rem; margin-bottom: 0.5rem; }
    ::ng-deep mat-form-field .mat-form-field-wrapper .mat-form-field-flex
      .mat-form-field-infix { width: initial; }

    .color-box { 
      display:inline-block; 
      height:14px; 
      width:14px;
      margin-right:4px; 
      border:1px solid #000;
    }`
  ],
})
export class MaterialSelectColorComponent implements OnInit {
  formControl: AbstractControl;
  controlName: string;
  controlValue: any;
  controlDisabled = false;
  boundControl = false;
  options: any;
  selectList: any[] = [];
  isArray = isArray;
  @Input() layoutNode: any;
  @Input() layoutIndex: number[];
  @Input() dataIndex: number[];

  constructor(
    private jsf: JsonSchemaFormService
  ) { }

  ngOnInit() {
    this.options = this.layoutNode.options || {};
    this.selectList = this.options.oneOf;

    // this.selectList = buildTitleMap(
    //   this.options.titleMap || this.options.enumNames,
    //   this.options.enum, !!this.options.required, !!this.options.flatList
    // );

    console.log(this.selectList);
    this.jsf.initializeControl(this, !this.options.readonly);
    if (!this.options.notitle && !this.options.description && this.options.placeholder) {
      this.options.description = this.options.placeholder;
    }
  }

  updateValue(event) {
    this.options.showErrors = true;
    this.jsf.updateValue(this, event.value);
  }
}
