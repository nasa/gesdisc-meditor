import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Document, DocHistory } from '../../service/model/models';
import { DefaultService } from '../../service/api/default.service';
import * as actions from './document.actions';
import * as workflowactions from 'app/store/workflow/workflow.actions';
import { tap } from 'rxjs/operators';

export * from './document.actions';

export interface DocumentStateModel {
	loading: boolean;
	documents: Document[];
	currentDocument: Document;
	currentDocumentTitle: string;
	currentDocumentModel: string;
	currentDocumentHistory: DocHistory;
	currentDocumentVersion: string;
}

@State<DocumentStateModel>({
	name: 'documents',
	defaults: {
		loading: false,
		documents: [],
		currentDocument: undefined,
		currentDocumentTitle: undefined,
		currentDocumentModel: undefined,
		currentDocumentHistory: undefined,
		currentDocumentVersion: undefined,
	},
})
export class DocumentState {

		@Selector() static loading(state: DocumentStateModel): boolean { return state.loading; }
		@Selector() static documents(state: DocumentStateModel): Document[] { return state.documents; }
		@Selector() static currentDocument(state: DocumentStateModel): Document { return state.currentDocument; }
		@Selector() static currentDocumentTitle(state: DocumentStateModel): string { return state.currentDocumentTitle; }
		@Selector() static currentDocumentModel(state: DocumentStateModel): string { return state.currentDocumentModel; }
		@Selector() static currentDocumentHistory(state: DocumentStateModel): DocHistory { return state.currentDocumentHistory; }
		@Selector() static currentDocumentVersion(state: DocumentStateModel): string { return state.currentDocumentVersion; }

		constructor(private store: Store, private service: DefaultService) {}

		@Action(actions.GetDocument)
		getDocument({ patchState, getState, dispatch }: StateContext<DocumentStateModel>, { payload }: actions.GetDocument) {
				patchState({ loading: true, });

				return this.service.getDocument(payload.model, payload.title, payload.version)
						.pipe(
								tap((document: Document) => {
									patchState({
										documents: [...getState().documents, document],
										currentDocument: document,
										currentDocumentTitle: payload.title,
										currentDocumentModel: payload.model,
										currentDocumentVersion: payload.version || document['x-meditor'].modifiedOn.toString(),
										loading: false,
									});
							}),
						);
		}

		@Action(actions.UpdateCurrentDocument)
		updateCurrentDocument({ patchState, getState }: StateContext<DocumentStateModel>, { payload }: actions.UpdateCurrentDocument) {
				patchState({ loading: true, });

				payload.document['x-meditor'] = { model: getState().currentDocumentModel };

				const documentBlob = new Blob([JSON.stringify(payload.document)]);

				return this.service.putDocument(documentBlob);
		}

		@Action(actions.GetCurrentDocumentHistory)
		getCurrentDocumentHistory({ patchState, getState }: StateContext<DocumentStateModel>) {
				patchState({ loading: true, });
				const document = getState().currentDocument;
				const documentTitle = getState().currentDocumentTitle;

				return this.service.getDocumentHistory(document['x-meditor'].model, documentTitle)
						.pipe(
								tap((history: DocHistory) => patchState({
										currentDocumentHistory: history,
										loading: false,
								})),
						);
		}

		@Action(actions.GetCurrentDocumentVersion)
		getCurrentDocumentVersion({ patchState, getState }: StateContext<DocumentStateModel>, { payload }: actions.GetCurrentDocumentVersion) {
				patchState({ currentDocumentVersion: payload.version });

				return this.store.dispatch(new actions.GetDocument({
						model: getState().currentDocumentModel,
						title: getState().currentDocumentTitle,
						version: payload.version,
				}));
		}

		@Action(actions.CreateDocument)
		createDocument({ patchState, getState }: StateContext<DocumentStateModel>, { payload }: actions.CreateDocument) {
				patchState({ loading: true });

				payload.document['x-meditor'] = { model: payload.model };

				const documentBlob = new Blob([JSON.stringify(payload.document)]);

				return this.service.putDocument(documentBlob)
						.pipe(
								tap(() => patchState({ loading: false }))
						);
		}

		@Action(actions.UpdateDocumentState)
		updateDocumentState({ patchState, getState }: StateContext<DocumentStateModel>, { payload }: actions.UpdateDocumentState) {
			patchState({ loading: true, });

			const currentDocumentTitle = getState().currentDocumentTitle;
			const currentDocumentModel = getState().currentDocumentModel;
			const currentDocumentVersion = getState().currentDocumentVersion;

			const state =  payload.state;

				return this.service.changeDocumentState(currentDocumentModel, currentDocumentTitle, state, currentDocumentVersion)
						.pipe(
							tap(() => patchState({ loading: false }))
						);
		}

}
