import { Routes } from '@angular/router';

import { DocEditPageComponent } from './containers/docedit/docedit-page.component';
import { DocNewPageComponent } from './containers/docnew/docnew-page.component';
import { DocumentExistsGuard } from './store/guards/document-exists.guard';

export const routes: Routes = [
	{ path: 'new',component: DocNewPageComponent },
	{ 
		path: 'edit', 
		canActivate: [ DocumentExistsGuard ],
		component: DocEditPageComponent 
	}
];
