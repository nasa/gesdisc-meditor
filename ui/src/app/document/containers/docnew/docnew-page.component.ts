import { Component, OnInit, HostListener } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ComponentCanDeactivate } from '../../../shared/guards/pending-changes.guard'
import { Document } from '../../../service'
import { ModelStore, UserStore, NotificationStore, DocumentStore } from '../../../store'
import { Observable } from 'rxjs'
import { Router } from '@angular/router'

@Component({
    selector: 'med-docnew-page',
    templateUrl: './docnew-page.component.html',
    styleUrls: ['./docnew-page.component.css'],
})
export class DocNewPageComponent implements OnInit, ComponentCanDeactivate {
    liveFormData: Document
    isFormValid: boolean
    dirty: boolean = false

    constructor(
        public modelStore: ModelStore,
        public userStore: UserStore,
        public documentStore: DocumentStore,
        private notificationStore: NotificationStore,
        private titleService: Title,
        private router: Router
    ) {}

    ngOnInit() {
        let modelName = this.modelStore.currentModel && this.modelStore.currentModel.name
        this.titleService.setTitle('Add new | ' + modelName + ' | mEditor')
    }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return !this.dirty || this.isFormValid
    }

    createDocument(document: any) {
        /*this.

        this.store
            .dispatch(new CreateDocument({ model: this.modelName, document }))
            .subscribe(this.onCreateDocumentSuccess.bind(this, document), this.onCreateDocumentError.bind(this))
            */
    }

    onCreateDocumentSuccess(document: any) {
        this.notificationStore.showSuccessNotification('Successfully created document')

        let model = this.modelStore.currentModel
        let modelName = model && model.name
        let titleProperty = model && model.titleProperty

        if (!modelName || !titleProperty) {
            throw new Error(`Model ${modelName} must have a title property`)
        }

        this.router.navigate(['/document/edit'], {
            queryParams: {
                model: modelName,
                title: document[titleProperty],
            },
        })
    }

    onCreateDocumentError() {
        this.notificationStore.showErrorNotification('Failed to create document, please review and try again.')
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
        this.createDocument(this.liveFormData)
    }
}
