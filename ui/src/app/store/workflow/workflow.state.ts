import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Workflow, Document, Edge, Privilege, Node } from 'app/service/model/models';
import { DefaultService } from '../../service/api/default.service';
import * as actions from './workflow.actions';
import * as user from 'app/store/auth/auth.actions';
import * as _ from 'underscore';
import { tap } from 'rxjs/operators';
import { Cache } from 'app/store/cache/cache.decorator';

export * from './workflow.actions';

export interface WorkflowStateModel {
	loading: boolean;
	currentWorkflow: Workflow;
	currentEdges: Edge[];
	currentNode: Node;
}

@State<WorkflowStateModel>({
	name: 'workflow',
	defaults: {
		loading: false,
		currentWorkflow: {},
		currentEdges: [{
			source: 'Init',
			target: 'Draft',
			label: 'Add New'
		}],
		currentNode: {
			id: 'Init',
			privileges: []
		}
	}
})

export class WorkflowState {

	@Selector() static loading(state: WorkflowStateModel): boolean { return state.loading; }
	@Selector() static currentWorkflow(state: WorkflowStateModel): Workflow { return state.currentWorkflow; }
	@Selector() static currentEdges(state: WorkflowStateModel): Edge[] { return state.currentEdges; }
	@Selector() static currentNode(state: WorkflowStateModel): Node { return state.currentNode; }
	@Selector() static currentNodePrivileges(state: WorkflowStateModel): Privilege[] {
		return state.currentNode.privileges;
	}

	constructor(private store: Store, private service: DefaultService) {}

	// @Cache('payload.title')
	@Action(actions.GetWorkflow)
	getWorkflow({ patchState }: StateContext<WorkflowStateModel>, { payload }: actions.GetWorkflow) {
		patchState({ loading: true });

		return this.service.getDocument('Workflows', payload.title)
			.pipe(
				tap((document: Document) => {
					patchState({
						currentWorkflow: document.doc as Workflow,
						currentEdges: this.findInitialEdges(document.doc.edges),
						currentNode: document.doc.nodes[0],
						loading: false
					});
			})
		);
	}

	@Action(actions.UpdateWorkflowState)
	updateWorkflowState({ getState, patchState, dispatch }: StateContext<WorkflowStateModel>, { payload }: actions.UpdateWorkflowState) {
		const node = getState().currentWorkflow.nodes.find(n => n.id === payload);
		const edges = getState().currentWorkflow.edges.filter(e => e.source === payload);
		patchState({
			currentNode: node,
			currentEdges: edges
		});
		dispatch(new user.GetUserPrivileges());
	}

	@Action(actions.SetInitialState)
	setInitialState({ getState, patchState, dispatch }: StateContext<WorkflowStateModel>, { }: actions.SetInitialState) {
		const node = getState().currentWorkflow.nodes[0];
		const edges = this.findInitialEdges(getState().currentWorkflow.edges);
		patchState({
			currentNode: node,
			currentEdges: edges
		});
		dispatch(new user.GetUserPrivileges());
	}

	findInitialEdges(edges: any) {
		const sources = _.pluck(edges, 'source');
		const targets = _.pluck(edges, 'target');
		const initEdge = sources.filter(e => !targets.includes(e))[0];
		return _.where(edges, { source: initEdge}) as Edge[];
	}
}
