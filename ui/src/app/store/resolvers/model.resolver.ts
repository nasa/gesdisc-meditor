import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs/Observable';
import { ModelState, GetModel } from 'app/store/model/model.state';
import { ModelCatalogEntry } from 'app/service';
import { GetWorkflow } from 'app/store/workflow/workflow.state';
import { GetUserPrivileges } from 'app/store/auth/auth.state';

@Injectable()
export class ModelResolver implements Resolve<void> {

	constructor(private store: Store) {}

	// remove this after caching is in place

	// @Select(ModelState.currentModel) selectedModel$: Observable<ModelCatalogEntry>;

	resolve(route: ActivatedRouteSnapshot) {
		const name = route.queryParams.model;

		return new Promise<void>((resolve: any) => {
			// remove this after caching is in place

			// this.selectedModel$.subscribe(model => {
			// 	if (model && model.name === name) {
			// 		resolve();
			// 	} else {

			//

					this.store
						.dispatch(new GetModel({ name }))
						.subscribe((store: any) => {
							const workflow = store.models.currentModel.workflow as string;
							if (workflow) {
								this.store
									.dispatch(new GetWorkflow({ title: workflow }))
									.subscribe((updatedstore: any) => {
										const workflownodes = updatedstore.workflow.currentWorkflow.nodes;
										if (workflownodes) {
											this.store.dispatch(new GetUserPrivileges);
											resolve(store.models.currentModel);
										}
									});
							}
					// 	});
					// }
			});
		});
	}
}
