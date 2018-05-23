import { Document } from '../../service/model/document';
import { DocumentActionsUnion, DocumentActionTypes } from '../actions/document.actions';

export interface State {
	document: any;
  currentDocument: Document;
}

const initialState: State = {
	document: '',
  currentDocument: {},
};


export function reducer(
	state: State = initialState,
	action: DocumentActionsUnion
): State {
	switch (action.type) {
		case DocumentActionTypes.LoadComplete: {

			return { currentDocument: action.payload, document: ''};
		}

		default: {
			return state;
		}
	}
}

export const getDocument = (state: State) => state.document.currentDocument;


