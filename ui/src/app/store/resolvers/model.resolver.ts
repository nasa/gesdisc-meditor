import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetModel } from 'app/store/model/model.state';
import { GetWorkflow } from 'app/store/workflow/workflow.state';

@Injectable()
export class ModelResolver implements Resolve<void> {

	constructor(private store: Store) {}

	resolve(route: ActivatedRouteSnapshot) {
		const name = route.queryParams.model;

		return new Promise<void>((resolve: any) => {
			this.store
				.dispatch(new GetModel({ name }))
				.subscribe((store: any) => {
					const workflow = store.models.currentModel.workflow as string;
					if (workflow) {
						this.store.dispatch(new GetWorkflow({ title: workflow }));
						resolve(store.models.currentModel);
					}
				});
		});
	}
}
