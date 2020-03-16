import { Component, OnInit, HostListener } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ComponentCanDeactivate } from '../../../shared/guards/pending-changes.guard'
import { Document } from '../../../service'
import { ModelStore, UserStore, NotificationStore, DocumentStore } from '../../../store'
import { Observable, from } from 'rxjs'
import { Router } from '@angular/router'

@Component({
    selector: 'med-docnew-page',
    templateUrl: './docnew-page.component.html',
    styleUrls: ['./docnew-page.component.css'],
})
export class DocNewPageComponent implements OnInit, ComponentCanDeactivate {
    privileges$: Observable<string[]>
    modelName: string
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

        if (!modelName) return

        this.privileges$ = from(this.userStore.retrievePrivilegesForModel(modelName))

        this.titleService.setTitle('Add new | ' + modelName + ' | mEditor')
    }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return !this.dirty || this.isFormValid
    }

    async createDocument(document: any) {
        let modelName = this.modelStore.currentModel && this.modelStore.currentModel.name
        let titleProperty = this.modelStore.currentModel && this.modelStore.currentModel.titleProperty

        if (!modelName || !titleProperty) return

        try {
            await this.documentStore.createOrUpdateDocument(document, modelName)

            this.notificationStore.showSuccessNotification('Successfully created document')

            this.router.navigate(['/document/edit'], {
                queryParams: {
                    model: modelName,
                    title: document[titleProperty],
                },
            })
        } catch (err) {
            console.error(err)
            this.notificationStore.showErrorNotification('Failed to create document, please review and try again')
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
        this.createDocument(this.liveFormData)
    }
}
