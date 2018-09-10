import { Routes } from '@angular/router';
import { DocumentResolver, ModelResolver } from 'app/shared/resolvers/';
import { DocEditPageComponent } from './containers/docedit/docedit-page.component';
import { DocNewPageComponent } from './containers/docnew/docnew-page.component';

export const routes: Routes = [
	{ 
		path: 'new', 
		resolve: {
			model: ModelResolver,
		},
		component: DocNewPageComponent,
	}, { 
		path: 'edit', 
		resolve: {
			document: DocumentResolver,
			model: ModelResolver,
		},
		component: DocEditPageComponent,
	}
];
