import { Routes } from '@angular/router';

import { DocEditPageComponent } from './containers/docedit/docedit-page.component';
import { DocNewPageComponent } from './containers/docnew/docnew-page.component';
import { DocumentResolver } from './store/guards/docedit.resolver';
import { DocumentExistsGuard } from './store/guards/document-exists.guard';

export const routes: Routes = [
	{ path: 'new', component: DocNewPageComponent },
	{ 
		path: 'edit', 
		// resolve: [ DocumentResolver ],
		canActivate: [ DocumentExistsGuard ],
		component: DocEditPageComponent 
	}
];
