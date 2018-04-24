import { ContentTypesActionTypes, ContentTypesActions } from '../actions/content-types';
import { ContentType } from '../models/content-type';

export interface State {
	contentTypes: ContentType[];
}

const initialState: State = {
	contentTypes: [],
};

export function reducer(
	state: State = initialState,
	action: ContentTypesActions
): State {
	switch (action.type) {
		case ContentTypesActionTypes.LoadComplete:
			console.log(action.payload);
			return Object.assign({}, state, { contentTypes: action.payload });

		default:
			return state;
	}
}

export const getContentTypes = (state: State) => state.contentTypes;
