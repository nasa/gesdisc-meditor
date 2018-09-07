import { WorkflowActionTypes, WorkflowActionsUnion } from "../actions/workflow.actions";
import { Workflow, Edge } from "../../service/model/workflow";

export interface State {
  currentWorkflow: Workflow,
  initalEdge: Edge,
  currentEdge: Edge,
  loaded: boolean
}

const initialState: State = {
  currentWorkflow: { 
    'roles': [],
    'nodes': [],
    'edges': []
  },
  initalEdge: { 
    'role': '',
    'source': '',
    'target': '',
    'label': ''
  },
  currentEdge: { 
    'role': '',
    'source': '',
    'target': '',
    'label': ''
  },
  loaded: false
};

export function reducer(state: State = initialState, action: WorkflowActionsUnion) {
	switch(action.type) {
    case WorkflowActionTypes.LoadWorkflow:
      return { ...state, loaded: false };
		case WorkflowActionTypes.LoadWorkflowComplete:
      return { ...state, currentWorkflow: action.payload, loaded: true };
    case WorkflowActionTypes.SetInitialEdge:
      return { ...state, initalEdge: action.payload };
    case WorkflowActionTypes.SetCurrentEdge:
      return { ...state, currentEdge: action.payload };
		default:
			return state;
	}
}


export const getWorkflow = (state: State) => state.currentWorkflow;
export const getWorkflowLoaded = (state: State) => state.loaded;
export const getWorkflowNodes = (state: State) => state.currentWorkflow.nodes;
export const getInitialEdge = (state: State) => state.initalEdge;
export const getCurrentEdge = (state: State) => state.currentEdge;