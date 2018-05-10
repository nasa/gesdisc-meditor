import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Document } from '../../service/model/document';
import { ResultActionsUnion, ResultActionTypes } from '../actions/result.actions';


/**
 * @ngrx/entity provides a predefined interface for handling
 * a structured dictionary of records. This interface
 * includes an array of ids, and a dictionary of the provided
 * model type by id. This interface is extended to include
 * any additional interface properties.
 */
export interface State extends EntityState<Document> {
	selectedDocumentId: string
}

/**
 * createEntityAdapter creates an object of many helper
 * functions for single or multiple operations
 * against the dictionary of records. The configuration
 * object takes a record id selector function and
 * a sortComparer option which is set to a compare
 * function if the records are to be sorted.
 */
export const adapter: EntityAdapter<Document> = createEntityAdapter<Document>({
	selectId: (result: Document) => result.title,
	sortComparer: false,
});

/**
 * getInitialState returns the default initial state
 * for the generated entity state. Initial state
 * additional properties can also be defined.
 */
export const initialState: State = adapter.getInitialState({
	selectedDocumentId: ''
});

export function reducer(
	state = initialState,
	action: ResultActionsUnion
): State {
	switch (action.type) {
		case ResultActionTypes.SearchComplete: {
			/**
			 * The addMany function provided by the created adapter
			 * adds many records to the entity dictionary
			 * and returns a new state including those records. If
			 * the collection is to be sorted, the adapter will
			 * sort each record upon entry into the sorted array.
			 */
			return adapter.addMany(action.payload, state);
		}

		case ResultActionTypes.ClearResults: {
			return adapter.removeAll({ ...state, selectedDocumentId: '' });
		}

		default: {
			return state;
		}
	}
}

export const getSelectedId = (state: State) => state.selectedDocumentId;

export const {
  selectIds: selectResultIds,
  selectEntities: selectResultEntities,
  selectAll: selectAllResults,
  selectTotal: selectResultsTotal,
} = adapter.getSelectors();
