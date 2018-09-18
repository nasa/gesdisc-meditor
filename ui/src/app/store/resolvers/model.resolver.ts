import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetModel } from 'app/store/model/model.state';
import { GetWorkflow } from 'app/store/workflow/workflow.state';
import { GetUserPrivileges } from 'app/store/auth/auth.state';

@Injectable()
export class ModelResolver implements Resolve<void> {

	constructor(private store: Store) {}

	private async getModel(name: string) {
		let store = await this.store.dispatch(new GetModel({ name })).toPromise();
		return store.models.currentModel;
	}

	private async getWorkflow(workflow: string) {
		if (!workflow) return;

		let store = await this.store.dispatch(new GetWorkflow({ title: workflow })).toPromise();
		return store.workflow.currentWorkflow;
	}

	async resolve(route: ActivatedRouteSnapshot) {
		const name = route.queryParams.model;

		const model = await this.getModel(name);
		const workflow = await this.getWorkflow(model.workflow);

		if (!workflow.nodes) throw new Error('Current workflow has no nodes');

		// this.store.dispatch(new GetUserPrivileges());

		return model;
	}
}
