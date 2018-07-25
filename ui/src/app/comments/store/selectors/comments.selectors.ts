import { createSelector } from '@ngrx/store';

import * as fromComments from '../reducers/comments.reducer';
import * as fromFeature from '../reducers';

export const selectComments = createSelector(
	fromFeature.getCommentsState,
	(state: fromFeature.CommentsState) => state.comments
);

export const selectCommentsIds = createSelector(
	selectComments,
	fromComments.selectCommentsIds
);
export const selectCommentsEntities = createSelector(
	selectComments,
	fromComments.selectCommentsEntities
);
export const selectAllComments = createSelector(
	selectComments,
	fromComments.selectAllComments
);
export const selectCommentsTotal = createSelector(
	selectComments,
	fromComments.selectCommentsTotal
);