import { ContentTypesActionTypes, ContentTypesActions } from '../actions/content-types';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { ContentType } from '../models/content-type';

export interface State extends EntityState<ContentType> {
	// selectedContentTypeId: number | null;
}

export const adapter: EntityAdapter<ContentType> = createEntityAdapter<ContentType>({
  selectId: (contentType: ContentType) => contentType.name,
  sortComparer: false,
});

export const initialState: State = adapter.getInitialState({
	// selectedContentTypeId: null
});

export function reducer(
	state: State = initialState,
	action: ContentTypesActions
): State {
	switch (action.type) {
		case ContentTypesActionTypes.LoadComplete:
			return adapter.addMany(action.payload, state);

		default:
			return state;
	}
}



