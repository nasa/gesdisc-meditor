import { createSelector, createFeatureSelector } from '@ngrx/store';

import * as fromWorkflow from '../reducers/workflow.reducer';

export const getWorkflowState = createFeatureSelector<fromWorkflow.State>('workflow');

export const selectWorkflow = createSelector(
	getWorkflowState,
	fromWorkflow.getWorkflow
);

export const selectWorkflowNodes = createSelector(
	getWorkflowState,
	fromWorkflow.getWorkflowNodes
);

export const selectInitialEdge = createSelector(
	getWorkflowState,
	fromWorkflow.getInitialEdge
);

export const selectCurrentEdge = createSelector(
	getWorkflowState,
	fromWorkflow.getCurrentEdge
);

export const selectWorkflowLoaded = createSelector(
	getWorkflowState,
	fromWorkflow.getWorkflowLoaded
);


export const selectCurrentNode = createSelector(
	selectWorkflowNodes,
	selectInitialEdge,
	(workflownodes, initialEdge) => { 
		let i = workflownodes.map(n => {return n.id}).indexOf(initialEdge.source);
		return workflownodes[i].privileges;
	}
);

