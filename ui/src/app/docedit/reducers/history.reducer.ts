import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { DocHistory } from '../../service/model/docHistory';
import { HistoryActionsUnion, HistoryActionTypes } from '../actions/history.actions';


/**
 * @ngrx/entity provides a predefined interface for handling
 * a structured dictionary of records. This interface
 * includes an array of ids, and a dictionary of the provided
 * model type by id. This interface is extended to include
 * any additional interface properties.
 */
export interface State extends EntityState<DocHistory> {
	selectedHistoryStamp: Date
}

/**
 * createEntityAdapter creates an object of many helper
 * functions for single or multiple operations
 * against the dictionary of records. The configuration
 * object takes a record id selector function and
 * a sortComparer option which is set to a compare
 * function if the records are to be sorted.
 */
export const adapter: EntityAdapter<DocHistory> = createEntityAdapter<DocHistory>({
	selectId: (historyEntry: DocHistory) => historyEntry.modifiedOn,
	sortComparer: false,
});

/**
 * getInitialState returns the default initial state
 * for the generated entity state. Initial state
 * additional properties can also be defined.
 */
export const initialState: State = adapter.getInitialState({
	selectedHistoryStamp: Date.now()
});

export function reducer(
	state = initialState,
	action: HistoryActionsUnion
): State {
	switch (action.type) {
		case HistoryActionTypes.LoadComplete: {
			/**
			 * The addMany function provided by the created adapter
			 * adds many records to the entity dictionary
			 * and returns a new state including those records. If
			 * the collection is to be sorted, the adapter will
			 * sort each record upon entry into the sorted array.
			 */
			return adapter.addMany(action.payload, state);
		}

		case HistoryActionTypes.ClearHistory: {
			return adapter.removeAll({ ...state, selectedHistoryStamp: Date.now() });
		}

		default: {
			return state;
		}
	}
}

export const getSelectedId = (state: State) => state.selectedHistoryStamp;

export const {
  selectIds: selectHistoryIds,
  selectEntities: selectHistoryEntities,
  selectAll: selectAllHistory,
  selectTotal: selectHistoryTotal,
} = adapter.getSelectors();
