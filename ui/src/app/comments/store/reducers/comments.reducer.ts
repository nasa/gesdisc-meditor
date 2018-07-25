import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Comment } from '../../../service/model/comment';
import { CommentsActionsUnion, CommentsActionTypes } from '../actions/comments.actions';


/**
 * @ngrx/entity provides a predefined interface for handling
 * a structured dictionary of records. This interface
 * includes an array of ids, and a dictionary of the provided
 * model type by id. This interface is extended to include
 * any additional interface properties.
 */
export interface State extends EntityState<Comment> {
}

/**
 * createEntityAdapter creates an object of many helper
 * functions for single or multiple operations
 * against the dictionary of records. The configuration
 * object takes a record id selector function and
 * a sortComparer option which is set to a compare
 * function if the records are to be sorted.
 */
export const adapter: EntityAdapter<Comment> = createEntityAdapter<Comment>({
	selectId: (comment: Comment) => comment._id,
	sortComparer: false
});

/**
 * getInitialState returns the default initial state
 * for the generated entity state. Initial state
 * additional properties can also be defined.
 */
export const initialState: State = adapter.getInitialState({
});

export function reducer(
	state = initialState,
	action: CommentsActionsUnion
): State {
	switch (action.type) {
		case CommentsActionTypes.LoadCommentsComplete: {

			return adapter.addMany(action.payload, {
        ...state
      });
		}

		case CommentsActionTypes.ResolveCommentComplete: {

			return adapter.updateOne({
				id: action.payload,
				changes: {resolved: true}
      }, state);
		}

		case CommentsActionTypes.ClearComments: {
			return adapter.removeAll({ ...state });
		}

		default: {
			return state;
		}
	}
}

export const {
  selectIds: selectCommentsIds,
  selectEntities: selectCommentsEntities,
  selectAll: selectAllComments,
  selectTotal: selectCommentsTotal,
} = adapter.getSelectors();
