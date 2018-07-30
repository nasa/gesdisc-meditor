import { createSelector } from '@ngrx/store';

import * as fromDocument from '../reducers/document.reducer';
import * as fromFeature from '../reducers';


export const getDocumentState = createSelector(
	fromFeature.getDocumentDataState,
	(state: fromFeature.DocumentDataState) => state.document
);

export const getDocument = createSelector(
	getDocumentState,
	fromDocument.getDocument
);