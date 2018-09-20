import { Privilege } from 'app/service/model/models';

export class GetWorkflow {
	static readonly type = '[Workflow] Get Workflow';

	constructor (public payload: {
			title: string,
			reload?: boolean,
	}) {}
}

export class UpdateWorkflowState {
	static readonly type = '[Workflow] Update Workflow State';

	constructor (public payload: string) {}
}

export class SetInitialState {
	static readonly type = '[Workflow] Set Initial State';

	constructor () {}
}
