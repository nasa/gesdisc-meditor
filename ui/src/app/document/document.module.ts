import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NO_ERRORS_SCHEMA } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { reducers } from './reducers/index';

import { EffectsModule } from '@ngrx/effects';
import { DocumentEffects } from './effects/document.effects';
import { HistoryEffects } from './effects/history.effects';
import { CommentsEffects } from '../comments/effects/comments.effects';

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
		EffectsModule.forFeature([DocumentEffects, HistoryEffects, CommentsEffects]),
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
