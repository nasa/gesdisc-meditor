import { ContentTypesActionTypes, ContentTypesActions } from '../actions/content-types';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ContentType } from '@models/content-type';

export interface State extends EntityState<ContentType> {
	selectedContentTypeId: string | null;
}

export const adapter: EntityAdapter<ContentType> = createEntityAdapter<ContentType>({
  selectId: (contentType: ContentType) => contentType.name,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
	selectedContentTypeId: 'Alerts'
});

export function reducer(
	state: State = initialState,
	action: ContentTypesActions
): State {
	switch (action.type) {
		case ContentTypesActionTypes.LoadComplete:
			return adapter.addMany(action.payload, state);

		case ContentTypesActionTypes.SelectContentType:
			return {
				...state,
				selectedContentTypeId: action.payload
			}

		default:
			return state;
	}
}

