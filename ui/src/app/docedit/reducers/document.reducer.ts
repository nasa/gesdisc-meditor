import { Document } from '../../service/model/document';
import { DocumentActionsUnion, DocumentActionTypes } from '../actions/document.actions';

export interface State {
  document: Document;
}

const initialState: State = {
  document: {},
};


export function reducer(
	state: State = initialState,
	action: DocumentActionsUnion
): State {
	switch (action.type) {
		case DocumentActionTypes.LoadComplete: {

			return { document: action.payload };
		}

		default: {
			return state;
		}
	}
}

export const getDocument = (state: State) => state.document;


