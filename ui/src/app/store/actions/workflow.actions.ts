import { Action } from '@ngrx/store';
import { Workflow, Edge } from '../../service/model/workflow';

export enum WorkflowActionTypes {
  LoadWorkflow = '[Workflow] Set workflow',
  LoadWorkflowComplete = '[Workflow] Set workflow complete',
  LoadWorkflowFail = '[Workflow] Set workflow failed',
  SetInitialEdge = '[Workflow] Set inital edge',
  SetCurrentEdge = '[Workflow] Set current edge',
}

export class LoadWorkflow implements Action {
  readonly type = WorkflowActionTypes.LoadWorkflow;
}

export class LoadWorkflowComplete implements Action {
  readonly type = WorkflowActionTypes.LoadWorkflowComplete;

  constructor(public payload: Workflow) { }
}

export class LoadWorkflowFail implements Action {
  readonly type = WorkflowActionTypes.LoadWorkflowFail;
}

export class SetInitialEdge implements Action {
  readonly type = WorkflowActionTypes.SetInitialEdge;

  constructor(public payload: Edge) { }
}

export class SetCurrentEdge implements Action {
  readonly type = WorkflowActionTypes.SetCurrentEdge;

  constructor(public payload: Edge) { }
}

export type WorkflowActionsUnion =
	| LoadWorkflow
  | LoadWorkflowComplete
  | LoadWorkflowFail
  | SetInitialEdge
  | SetCurrentEdge;