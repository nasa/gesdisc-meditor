import { Component, ViewChild, OnInit, HostListener } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { MatSidenav } from '@angular/material/sidenav'
import { ComponentCanDeactivate } from '../../../shared/guards/pending-changes.guard'
import { Document, DocHistory, Comment } from '../../../service'
import { ModelStore, WorkflowStore, UserStore, DocumentStore, NotificationStore } from '../../../store'
import { Observable } from 'rxjs'
import { Router } from '@angular/router'
import { map } from 'rxjs/operators'

@Component({
    selector: 'med-docedit-page',
    templateUrl: './docedit-page.component.html',
    styleUrls: ['./docedit-page.component.css'],
})
export class DocEditPageComponent implements OnInit, ComponentCanDeactivate {
    @ViewChild('sidenav') sidenav: MatSidenav

    readonly commentsCount$: Observable<number> = this.documentStore.currentDocumentComments$.pipe(
        map((comments: Comment[]) => comments.length)
    )
    readonly versionsCount$: Observable<number> = this.documentStore.currentDocumentHistory$.pipe(
        map((history: DocHistory[]) => history.length)
    )

    modelName: string
    titleProperty: string
    versionFilter: Date = new Date()
    readonlydoc = true
    liveFormData: Document
    isFormValid: boolean = false
    showHistory: boolean
    showComments: boolean
    dirty: boolean = false

    constructor(
        public modelStore: ModelStore,
        public workflowStore: WorkflowStore,
        public userStore: UserStore,
        public documentStore: DocumentStore,
        private notificationStore: NotificationStore,
        private titleService: Title,
        private router: Router
    ) {}

    ngOnInit() {
        /*
        this.workflowSubscriber = this.workflow$.subscribe(workflow => {
            if (workflow) {
                this.documentSubscriber = this.document$.subscribe(document => {
                    this.store.dispatch(
                        new UpdateWorkflowState(document['x-meditor'].state)
                    )
                    this.titleService.setTitle(
                        document.doc[this.titleProperty] +
                            ' | ' +
                            this.modelName +
                            ' | mEditor'
                    )
                })
            }
        })*/
    }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return !this.dirty
    }

    async submitDocument(document: any) {
        try {
            await this.documentStore.createOrUpdateDocument(document) // save changes to the document

            await this.documentStore.fetchDocument(this.modelName, document[this.titleProperty]) // fetch the newest version

            this.notificationStore.showSuccessNotification('Successfully updated document')
        } catch (err) {
            console.error(err)
            this.notificationStore.showErrorNotification('Failed to update document, please review and try again')
        }
    }

    showDocumentHistory() {
        this.showHistory = !this.showHistory
        this.sidenav.open()
    }

    toggleDocumentComments() {
        if (this.showComments) {
            this.sidenav.close()
        } else {
            this.showComments = true
            this.sidenav.open()
        }
    }

    resetSidenav() {
        this.showComments = false
        this.showHistory = false
    }

    async loadVersion(version: string) {
        await this.documentStore.fetchDocument(
            this.documentStore.currentDocumentModel,
            this.documentStore.currentDocumentTitle,
            version
        )

        let versionIdx = this.documentStore.currentDocumentHistory.findIndex(i => i.modifiedOn.toString() == version)
        if (versionIdx - 1 > -1) {
            this.versionFilter = this.documentStore.currentDocumentHistory[versionIdx - 1].modifiedOn
        } else {
            this.versionFilter = new Date()
        }
    }

    async updateState(target: string) {
        try {
            await this.documentStore.updateCurrentDocumentState(target)

            this.notificationStore.showSuccessNotification('Document sent successfully')

            // TODO: this.store.dispatch(new SetInitialState())

            this.router.navigate(['/search'], {
                queryParams: {
                    model: this.modelName,
                },
            })
        } catch (err) {
            console.error(err)
            this.notificationStore.showErrorNotification(
                'Faield to change document state, please review and try again.'
            )
        }
    }

    isValid(event: boolean) {
        this.isFormValid = event
    }

    isDirty(event: boolean) {
        this.dirty = event
    }

    liveData(event: Document) {
        this.liveFormData = event
    }

    saveDocument() {
        this.submitDocument(this.liveFormData)
    }
}
