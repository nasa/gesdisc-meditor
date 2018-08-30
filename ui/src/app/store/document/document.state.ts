import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { Document, DocHistory } from '../../service/model/models';
import { DefaultService } from '../../service/api/default.service';
import * as actions from './document.actions';
import { tap } from 'rxjs/operators';

export * from './document.actions';

export interface DocumentStateModel {
    loading: boolean;
    documents: Document[];
    currentDocument: Document;
    currentDocumentHistory: DocHistory[];
}

@State<DocumentStateModel>({
    name: 'documents',
    defaults: {
        loading: false,
        documents: [],
        currentDocument: undefined,
        currentDocumentHistory: [],
    },
})
export class DocumentState {

    @Selector()
    static loading(state: DocumentStateModel): boolean {
        return state.loading;
    }

    @Selector()
    static documents(state: DocumentStateModel): Document[] {
        return state.documents;
    }

    @Selector()
    static currentDocument(state: DocumentStateModel): Document {
        return state.currentDocument;
    }

    @Selector()
    static currentDocumentHistory(state: DocumentStateModel): DocHistory[] {
        return state.currentDocumentHistory;
    }

    constructor(private store: Store, private service: DefaultService) {}

    @Action(actions.GetDocument)
    getDocument({ patchState, getState }: StateContext<DocumentStateModel>, { payload }: actions.GetDocument) {
        // find requested document in the state's cached array of documents
        let document = getState().documents.find((document: Document) => {
            let documentTitle = document.doc[payload.titleProperty];
            let documentModel = document['x-meditor'].model;

            return documentTitle === payload.title && documentModel === payload.model;
        });

        if (document && !payload.reload) {
            patchState({ currentDocument: document, });   // use cached document
            return
        } 
        
        // fetch document from the API since either the document hasn't been fetched yet 
        // or a reload has been requested
        
        patchState({ loading: true, });

        return this.service.getDocument(payload.model, payload.title)
            .pipe(
                tap((document: Document) => patchState({ 
                    documents: [...getState().documents, document],
                    currentDocument: document,
                    loading: false,
                })),
            );
    }

    @Action(actions.SaveDocument)
    saveDocumentHistory({ patchState, getState }: StateContext<DocumentStateModel>, { payload }: actions.SaveDocument) {
        patchState({ loading: true, });

        payload.document['x-meditor'] = { model: payload.model, };
        
        let documentBlob = new Blob([JSON.stringify(payload.document)]);

        return this.service.putDocument(documentBlob);
    }

    @Action(actions.GetDocumentHistory)
    getDocumentHistory({ patchState, getState }: StateContext<DocumentStateModel>, { payload }: actions.GetDocumentHistory) {
        patchState({ loading: true, });

        console.log('get document history')

        return this.service.getDocumentHistory(payload.model, payload.title)
        /*
            .pipe(
                tap((history: ) => patchState({ 
                    documents: [...getState().documents, document],
                    currentDocument: document,
                    loading: false,
                })),
            );*/
    }

}