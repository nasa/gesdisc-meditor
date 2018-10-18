import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Document, DocHistory, Comment } from '../../service/model/models';
import { DefaultService } from '../../service/api/default.service';
import * as actions from './document.actions';
import * as workflowactions from 'app/store/workflow/workflow.actions';
import { tap } from 'rxjs/operators';

export * from './document.actions';
import * as _ from 'underscore';
import { AuthState } from 'app/store/auth/auth.state';

export interface DocumentStateModel {
	loading: boolean;
	documents: Document[];
	currentDocument: Document;
	currentDocumentTitle: string;
	currentDocumentModel: string;
	currentDocumentHistory: DocHistory;
	currentDocumentVersion: string;
  currentDocumentComments: Comment[];
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
    currentDocumentComments: undefined
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
    @Selector() static currentDocumentComments(state: DocumentStateModel): Comment[] { return state.currentDocumentComments; }

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

    @Action(actions.GetCurrentDocumentComments)
		getCurrentDocumentComments({ patchState, getState }: StateContext<DocumentStateModel>) {
				patchState({ loading: true, });
				const documentTitle = getState().currentDocumentTitle;

				return this.service.getComments(documentTitle)
						.pipe(
								tap((comments: Comment[]) => patchState({
										currentDocumentComments: comments,
										loading: false,
								})),
						);
		}

    @Action(actions.ResolveComment)
		resolveComment({ patchState, getState, dispatch }: StateContext<DocumentStateModel>, { payload }: actions.ResolveComment) {
				// patchState({ loading: true, });
				// const documentTitle = getState().currentDocumentTitle;

				return this.service.resolveComment(payload)
          .pipe(
            tap(() => { 
              // let resolvedComment = _.findWhere(getState().currentDocumentComments, {_id: payload});
              // resolvedComment!.resolved = true;
              // patchState({
              //   currentDocumentComments: [...getState().currentDocumentComments, resolvedComment!]
              // })
              dispatch(new actions.GetCurrentDocumentComments())
            }),
          );
		}

    @Action(actions.SubmitComment)
		submitComment({ patchState, getState, dispatch }: StateContext<DocumentStateModel>, { payload }: actions.SubmitComment) {
				patchState({ loading: true, });

				payload.documentId = getState().currentDocumentTitle;
        let user = this.store.selectSnapshot(AuthState.user);
        payload.createdBy = user.firstName + ' '  + user.lastName;
        const commentBlob = new Blob([JSON.stringify(payload)]);

				return this.service.postComment(commentBlob)
          .pipe(
            tap(() => {
              // patchState({ currentDocumentComments: [...getState().currentDocumentComments, payload]})
              dispatch(new actions.GetCurrentDocumentComments())
            })
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
