import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router';
import { Store } from '@ngxs/store';
import { GetModel } from 'app/store/model/model.state';
import { GetWorkflow } from 'app/store/workflow/workflow.state';
import { GetUserPrivileges } from 'app/store/auth/auth.state';

@Injectable()
export class ModelResolver implements Resolve<void> {

	constructor(private store: Store) {}

	private async getModel(name: string, reload?: boolean) {
		let store = await this.store.dispatch(new GetModel({ name, reload })).toPromise();
		return store.models.currentModel;
	}

	private async getWorkflow(title: string, reload?: boolean) {
		if (!title) return;

		let store = await this.store.dispatch(new GetWorkflow({ title })).toPromise();
		return store.workflow.currentWorkflow;
	}

	async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const name = route.queryParams.model;
		const reload = state.url.indexOf('/search') > -1

		const model = await this.getModel(name, reload);
		const workflow = await this.getWorkflow(model.workflow, reload);

		if (!workflow.nodes) throw new Error('Current workflow has no nodes');

		return model;
	}
}
