import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material';
import { CKEditorModule } from 'ngx-ckeditor';

import { MaterialCkeditorComponent } from './widgets/material-ckeditor.component';

import { NO_ERRORS_SCHEMA } from '@angular/core';

import { StoreModule } from '@ngrx/store';

import { reducer } from './reducers/document.reducer';

import { EffectsModule } from '@ngrx/effects';
import { DocumentEffects } from './effects/document.effects';

import {
  JsonSchemaFormModule, MaterialDesignFrameworkModule, MaterialDesignFramework,
  WidgetLibraryService, FrameworkLibraryService, JsonSchemaFormService, Framework
} from 'angular2-json-schema-form';

import { DocEditPageComponent } from './containers/docedit-page.component';
import { DocumentEditComponent } from './components/document-edit/document-edit.component';



@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    CKEditorModule,
    StoreModule.forFeature('document', reducer),
		EffectsModule.forFeature([DocumentEffects]),
    MaterialDesignFrameworkModule,
    {
      ngModule: JsonSchemaFormModule,
      providers: [
        JsonSchemaFormService,
        FrameworkLibraryService,
				WidgetLibraryService,
				{ provide: Framework, useClass: MaterialDesignFramework, multi: true}
      ]
    }
  ],
  declarations: [
  	DocEditPageComponent,
  	MaterialCkeditorComponent,
  	DocumentEditComponent
  ],
  entryComponents: [
  	MaterialCkeditorComponent
  ],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class DocEditModule {
}
