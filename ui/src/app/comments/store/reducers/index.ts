import {
	createFeatureSelector,
	ActionReducerMap,
} from '@ngrx/store';
import * as fromComments from './comments.reducer';

export interface CommentsState {
	comments: fromComments.State;
}

export const reducers: ActionReducerMap<CommentsState> = {
	comments: fromComments.reducer
};

export const getCommentsState = createFeatureSelector<CommentsState>('comments');



