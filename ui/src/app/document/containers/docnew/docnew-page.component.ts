import { Component, OnInit, HostListener } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { Observable } from 'rxjs/Observable'
import { Store, Select } from '@ngxs/store'
import { Model } from 'app/service/model/models'
import { ModelState, AuthState } from 'app/store'
import { CreateDocument } from 'app/store/document/document.state'
import { Navigate } from '@ngxs/router-plugin'
import {
    SuccessNotificationOpen,
    ErrorNotificationOpen,
} from 'app/store/notification/notification.state'
import { ComponentCanDeactivate } from 'app/shared/guards/pending-changes.guard'

@Component({
    selector: 'med-docnew-page',
    templateUrl: './docnew-page.component.html',
    styleUrls: ['./docnew-page.component.css'],
})
export class DocNewPageComponent implements OnInit, ComponentCanDeactivate {
    @Select(ModelState.currentModel) model$: Observable<Model>
    @Select(AuthState.userPrivileges) userPrivileges$: Observable<string[]>

    modelName: string
    titleProperty: string
    liveFormData: Document
    isFormValid: boolean
    dirty: boolean = false
    modelSubscriber: any

    constructor(private store: Store, private titleService: Title) {}

    ngOnInit() {
        this.modelSubscriber = this.model$.subscribe((model: any) => {
            this.modelName = model.name
            this.titleProperty = model.titleProperty
        })

        this.titleService.setTitle('Add new | ' + this.modelName + ' | mEditor')
    }

    ngOnDestroy() {
        this.modelSubscriber.unsubscribe()
    }

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return !this.dirty || this.isFormValid
    }

    createDocument(document: any) {
        this.store
            .dispatch(new CreateDocument({ model: this.modelName, document }))
            .subscribe(
                this.onCreateDocumentSuccess.bind(this, document),
                this.onCreateDocumentError.bind(this)
            )
    }

    onCreateDocumentSuccess(document: any) {
        this.store.dispatch(
            new SuccessNotificationOpen('Successfully created document')
        )
        this.store.dispatch(
            new Navigate(['/document/edit'], {
                model: this.modelName,
                title: document[this.titleProperty],
            })
        )
    }

    onCreateDocumentError() {
        this.store.dispatch(
            new ErrorNotificationOpen(
                'Failed to create document, please review and try again.'
            )
        )
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
