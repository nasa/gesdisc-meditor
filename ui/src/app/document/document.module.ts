import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { reducers, effects } from './store';

import {
  JsonSchemaFormModule, MaterialDesignFrameworkModule, MaterialDesignFramework,
  WidgetLibraryService, FrameworkLibraryService, JsonSchemaFormService, Framework
} from 'angular2-json-schema-form';

import { DocEditPageComponent } from './containers/docedit-page.component';
import { DocumentEditComponent } from './components/document-edit/document-edit.component';
import { DochistoryComponent } from './components/dochistory/dochistory.component';
import { CommentsModule } from '../comments/comments.module';

import { routes } from './document.routing';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule,
		ReactiveFormsModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('documentData', reducers),
		EffectsModule.forFeature(effects),
    MaterialDesignFrameworkModule,
    CommentsModule,
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
  	DocumentEditComponent,
  	DochistoryComponent
  ],
  entryComponents: [
  	DocEditPageComponent
  ]
})
export class DocumentModule {
}
