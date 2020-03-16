import { Injectable } from '@angular/core'
import { BehaviorSubject, pipe } from 'rxjs'
import { DefaultService } from '../service/api/default.service'
import { Document, DocHistory, Comment, Success } from '../service'
import { UserStore } from './user.store'

@Injectable({ providedIn: 'root' })
export class DocumentStore {
    private readonly _currentDocument = new BehaviorSubject<Document>({})
    private readonly _currentDocumentTitle = new BehaviorSubject<string>('')
    private readonly _currentDocumentModel = new BehaviorSubject<string>('')
    private readonly _currentDocumentHistory = new BehaviorSubject<DocHistory[]>([])
    private readonly _currentDocumentVersion = new BehaviorSubject<string>('')
    private readonly _currentDocumentComments = new BehaviorSubject<Comment[]>([])

    readonly currentDocument$ = this._currentDocument.asObservable()
    readonly currentDocumentTitle$ = this._currentDocumentTitle.asObservable()
    readonly currentDocumentModel$ = this._currentDocumentModel.asObservable()
    readonly currentDocumentHistory$ = this._currentDocumentHistory.asObservable()
    readonly currentDocumentVersion$ = this._currentDocumentVersion.asObservable()
    readonly currentDocumentComments$ = this._currentDocumentComments.asObservable()

    constructor(private userStore: UserStore, private service: DefaultService) {
        //
    }

    get currentDocument(): Document {
        return this._currentDocument.getValue()
    }

    set currentDocument(currentDocument: Document) {
        this._currentDocument.next(currentDocument)
    }

    get currentDocumentTitle(): string {
        return this._currentDocumentTitle.getValue()
    }

    set currentDocumentTitle(currentDocumentTitle: string) {
        this._currentDocumentTitle.next(currentDocumentTitle)
    }

    get currentDocumentModel(): string {
        return this._currentDocumentModel.getValue()
    }

    set currentDocumentModel(currentDocumentModel: string) {
        this._currentDocumentModel.next(currentDocumentModel)
    }

    get currentDocumentHistory(): DocHistory[] {
        return this._currentDocumentHistory.getValue()
    }

    set currentDocumentHistory(currentDocumentHistory: DocHistory[]) {
        this._currentDocumentHistory.next(currentDocumentHistory)
    }

    get currentDocumentVersion(): string {
        return this._currentDocumentVersion.getValue()
    }

    set currentDocumentVersion(currentDocumentVersion: string) {
        this._currentDocumentVersion.next(currentDocumentVersion)
    }

    get currentDocumentComments(): Comment[] {
        return this._currentDocumentComments.getValue()
    }

    set currentDocumentComments(currentDocumentComments: Comment[]) {
        this._currentDocumentComments.next(currentDocumentComments)
    }

    /**
     * retrieves a document from the API service
     */
    async fetchDocument(modelName: string, title: string, version?: string) {
        this.currentDocument = await this.service.getDocument(modelName, title, version).toPromise()

        this.currentDocumentTitle = title
        this.currentDocumentModel = modelName
        // @ts-ignore
        this.currentDocumentVersion = version || document['x-meditor'].modifiedOn.toString()

        await this.fetchCurrentDocumentHistory()
        await this.fetchCurrentDocumentComments()

        return this.currentDocument
    }

    /**
     * updates the current document
     */
    async updateCurrentDocument(document: any) {
        // TODO: clean this up, if we're updating a document it should already know what model it's in
        document['x-meditor'] = {
            model: this.currentDocumentModel,
        }

        let documentBlob = new Blob([JSON.stringify(document)])

        await this.service.putDocument(documentBlob).toPromise()
    }

    /**
     * updates the state of the current document
     * @param state
     */
    async updateCurrentDocumentState(state: string) {
        await this.service.changeDocumentState(
            this.currentDocumentModel,
            this.currentDocumentTitle,
            state,
            this.currentDocumentVersion
        )
    }

    /**
     * resolves a given comment
     * @param id
     */
    async resolveComment(id: string) {
        let resolvedBy = this.userStore.user.uid
        await this.service.resolveComment(id, resolvedBy)
        await this.fetchCurrentDocumentComments()
    }

    /**
     * updates a comments text
     * @param id
     * @param text
     */
    async updateComment(id: string, text: string) {
        await this.service.editComment(id, text)
        await this.fetchCurrentDocumentComments()
    }

    /**
     * submit a new comment
     * @param comment
     */
    async createComment(comment: Comment) {
        let user = this.userStore.user

        comment.documentId = this.currentDocumentTitle
        comment.model = this.currentDocumentModel
        comment.version = this.currentDocumentVersion
        comment.createdBy = `${user.firstName} ${user.lastName}`
        comment.userUid = user.uid // TODO: API should set this, UI passing it means anyone can spoof a user

        let commentBlob = new Blob([JSON.stringify(comment)])

        await this.service.postComment(commentBlob)
        await this.fetchCurrentDocumentComments()
    }

    /**
     * retrieves the history for the current document
     */
    private async fetchCurrentDocumentHistory() {
        this.currentDocumentHistory = await this.service
            .getDocumentHistory(this.currentDocumentModel, this.currentDocumentTitle)
            .toPromise()
        return this.currentDocumentHistory
    }

    /**
     * retrieves the comments for the current document
     */
    private async fetchCurrentDocumentComments() {
        this.currentDocumentComments = await this.service
            .getComments(this.currentDocumentTitle, this.currentDocumentModel)
            .toPromise()
        return this.currentDocumentComments
    }
}
