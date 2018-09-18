import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Workflow, Document, Edge, Privilege, Node } from 'app/service/model/models';
import { DefaultService } from '../../service/api/default.service';
import * as actions from './workflow.actions';
import * as user from 'app/store/auth/auth.actions';
import * as _ from 'underscore';
import { tap } from 'rxjs/operators';

export * from './workflow.actions';

export interface WorkflowStateModel {
	currentWorkflow: Workflow;
	currentEdges: Edge[];
	currentNode: Node;
}

@State<WorkflowStateModel>({
	name: 'workflow',
	defaults: {
		currentWorkflow: undefined,
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

	@Selector() static currentWorkflow(state: WorkflowStateModel): Workflow { return state.currentWorkflow; }
	@Selector() static currentEdges(state: WorkflowStateModel): Edge[] { return state.currentEdges; }
	@Selector() static currentNode(state: WorkflowStateModel): Node { return state.currentNode; }
	@Selector() static currentNodePrivileges(state: WorkflowStateModel): Privilege[] {
		return state.currentNode.privileges;
	}

	constructor(private store: Store, private service: DefaultService) {}

	@Action(actions.GetWorkflow)
	getWorkflow({ patchState, getState, dispatch }: StateContext<WorkflowStateModel>, { payload }: actions.GetWorkflow) {
		const workflow: any = getState().currentWorkflow;
		const useCache: boolean = workflow && workflow.name === payload.title && !payload.reload;
	
		const getWorkflowCallback = (document: any) => {
			patchState({
				currentWorkflow: document as Workflow,
				currentEdges: this.findInitialEdges(document.edges),
				currentNode: document.nodes[0],
			});

			dispatch(new user.GetUserPrivileges())
		};

		if (useCache) {
			return getWorkflowCallback(workflow);
		} else {
			return this.service.getDocument('Workflows', payload.title)
				.pipe(tap((workflow: any) => getWorkflowCallback(workflow.doc)));
		}
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
