import { Routes } from '@angular/router';
import { ModelResolver, DocEditResolver, } from 'app/store/resolvers/';
import { DocEditPageComponent } from './containers/docedit/docedit-page.component';
import { DocNewPageComponent } from './containers/docnew/docnew-page.component';
import { PendingChangesGuard } from 'app/shared/guards/pending-changes.guard';

export const routes: Routes = [
	{
		path: 'new',
		resolve: {
			model: ModelResolver,
		},
		component: DocNewPageComponent,
		canDeactivate: [ PendingChangesGuard ],
	},
	{
		path: 'edit',
		resolve: {
			docedit: DocEditResolver
		},
		component: DocEditPageComponent,
		canDeactivate: [ PendingChangesGuard ],
	}
];
