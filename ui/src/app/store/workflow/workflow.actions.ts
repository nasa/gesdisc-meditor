export class GetWorkflow {
	static readonly type = '[Document] Get Workflow';

	constructor (public payload: {
			title: string
	}) {}
}
