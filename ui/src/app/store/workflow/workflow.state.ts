import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Workflow, Document, Edge, Privilege } from 'app/service/model/models';
import { DefaultService } from '../../service/api/default.service';
import * as actions from './workflow.actions';
import * as _ from 'underscore';
import { tap } from 'rxjs/operators';

export * from './workflow.actions';

export interface WorkflowStateModel {
	loading: boolean;
	currentWorkflow: Workflow;
	currentEdge: Edge;
}

@State<WorkflowStateModel>({
	name: 'workflow',
	defaults: {
		loading: false,
		currentWorkflow: {},
		currentEdge: {
			source: 'Init',
			target: 'Draft',
			label: 'Init'
		}
	}
})

export class WorkflowState {

	@Selector() static loading(state: WorkflowStateModel): boolean { return state.loading; }
	@Selector() static currentWorkflow(state: WorkflowStateModel): Workflow { return state.currentWorkflow; }
	@Selector() static currentEdge(state: WorkflowStateModel): Edge { return state.currentEdge; }
	@Selector() static currentNodePrivileges(state: WorkflowStateModel): Privilege[] {
		const i = state.currentWorkflow.nodes.map(n =>  n.id).indexOf(state.currentEdge.source);
		return state.currentWorkflow.nodes[i].privileges;
	}

	constructor(private store: Store, private service: DefaultService) {}

	@Action(actions.GetWorkflow)
	getDocument({ patchState, getState }: StateContext<WorkflowStateModel>, { payload }: actions.GetWorkflow) {
		patchState({ loading: true });

		return this.service.getDocument('Workflows', payload.title)
			.pipe(
				tap((document: Document) => patchState({
					currentWorkflow: document.doc as Workflow,
					currentEdge: this.findInitialEdge(document.doc.edges),
					loading: false
				}))
			);
	}

	findInitialEdge(edges: any) {
		const sources = _.pluck(edges, 'source');
		const targets = _.pluck(edges, 'target');
		const initEdge = sources.filter(e => !targets.includes(e))[0];
		return _.findWhere(edges, { source: initEdge}) as Edge;
	}
}
