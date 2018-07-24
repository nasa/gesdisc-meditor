import { Document } from '../../service/model/document';
import { DocumentActionsUnion, DocumentActionTypes } from '../actions/document.actions';

export interface State {
  currentDocument: Document;
}

const initialState: State = {
  currentDocument: {},
};


export function reducer(
	state: State = initialState,
	action: DocumentActionsUnion
): State {
	switch (action.type) {
		case DocumentActionTypes.LoadComplete: {

			return { currentDocument: action.payload};
		}

		default: {
			return state;
		}
	}
}

export const getDocument = (state: State) => state.currentDocument;


