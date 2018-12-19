import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';

import {
	JsonSchemaFormModule, MaterialDesignFrameworkModule, MaterialDesignFramework,
	WidgetLibraryService, FrameworkLibraryService, JsonSchemaFormService, Framework
} from 'angular2-json-schema-form';

import { DocEditPageComponent } from './containers/docedit/docedit-page.component';
import { DocNewPageComponent } from './containers/docnew/docnew-page.component';

import { DocumentEditComponent } from './components/document-edit/document-edit.component';
import { DochistoryComponent } from './components/dochistory/dochistory.component';
import { DocBreadcrumbsComponent } from './components/docbreadcrumbs/docbreadcrumbs.component';
import { CommentsModule } from '../comments/comments.module';

import { routes } from './document.routing';
import { DocactionsComponent } from './components/docactions/docactions.component';

@NgModule({
	imports: [
		CommonModule,
		MaterialModule,
		FlexLayoutModule,
		FormsModule,
		ReactiveFormsModule,
    ScrollingModule,
		RouterModule.forChild(routes),
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
		DocNewPageComponent,
		DocumentEditComponent,
		DochistoryComponent,
		DocactionsComponent,
		DocBreadcrumbsComponent,
	],
	entryComponents: [
		DocEditPageComponent
	]
})

export class DocumentModule {
}
