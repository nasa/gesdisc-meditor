import {
    Component,
    ChangeDetectionStrategy,
    OnInit,
    ApplicationRef,
    NgZone,
} from '@angular/core'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { map, tap, withLatestFrom } from 'rxjs/operators'
import * as _ from 'underscore'
import { Observable } from 'rxjs/Observable'
import { Store, Select } from '@ngxs/store'
import { GetModel, GetModelDocuments } from 'app/store/model/model.state'
import {
    UpdateWorkflowState,
    GetWorkflow,
} from 'app/store/workflow/workflow.state'
import { GetUserPrivileges } from 'app/store/auth/auth.state'
import { Navigate } from '@ngxs/router-plugin'
import {
    ModelCatalogEntry,
    DocCatalogEntry,
    Edge,
    Model,
} from 'app/service/model/models'
import { AuthState, ModelState, WorkflowState } from 'app/store'
import { forceTickOnRender } from '../../shared/utils'

import { ModelStore } from '../../store/model.store'
import { WorkflowStore } from '../../store/workflow.store'

@Component({
    selector: 'med-search-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './search-page.component.html',
    styles: [``],
})
export class SearchPageComponent {
    constructor(
        private modelStore: ModelStore,
        private workflowStore: WorkflowStore,
        private titleService: Title,
        private router: Router,
        private applicationRef: ApplicationRef,
        private zone: NgZone
    ) {
        forceTickOnRender(router, applicationRef, zone)
    }

    ngOnInit() {
        console.log('page loaded')
    }

    changeModel(model: string) {
        this.router.navigate(['/search'], { queryParams: { model } })
    }

    /*
    @Select(ModelState.models) models$: Observable<ModelCatalogEntry[]>
    @Select(ModelState.currentModel) selectedModel$: Observable<Model>
    @Select(ModelState.currentModelDocuments)
    selectedModelDocuments$: Observable<DocCatalogEntry[]>
    @Select(AuthState.userPrivileges) userPrivileges$: Observable<string[]>
    @Select(WorkflowState.currentEdges) currentEdges$: Observable<Edge[]>

    filteredDocuments$: Observable<DocCatalogEntry[]>
    selectedModelName: string
    modelSubscriber: any
    modelDocumentsSubscriber: any

    

    ngOnInit() {
        this.modelSubscriber = this.selectedModel$.subscribe(
            this.selectedModelChanged.bind(this)
        )
        this.modelDocumentsSubscriber = this.selectedModelDocuments$.subscribe(
            this.selectedModelDocumentsChanged.bind(this)
        )
    }

    ngOnDestroy() {
        this.modelSubscriber.unsubscribe()
        this.modelDocumentsSubscriber.unsubscribe()
    }

    selectedModelChanged(model: Model) {
        if (this.selectedModelName === model.name) {
            return
        }

        this.selectedModelName = model.name
        this.store.dispatch(new GetModelDocuments())
        this.store.dispatch(new GetWorkflow({ title: model.workflow }))
        this.store.dispatch(new GetUserPrivileges())
        this.titleService.setTitle(this.selectedModelName + ' | mEditor')
    }

    selectedModelDocumentsChanged() {
        this.filteredDocuments$ = this.selectedModelDocuments$
    }

    filterDocuments(event: string) {
        this.filteredDocuments$ = this.selectedModelDocuments$.pipe(
            map(this.filterDocumentsBySearchTerm.bind(this, event))
        )
    }

    filterDocumentsBySearchTerm(
        searchTerm: string,
        documents: DocCatalogEntry[]
    ) {
        return documents.filter(
            this.documentContainSearchTerm.bind(this, searchTerm)
        )
    }

    documentContainSearchTerm(searchTerm: string, document: DocCatalogEntry) {
        if (!document.title) return false
        return document.title.search(new RegExp(searchTerm, 'i')) !== -1
    }

    sortByChanged(event: string) {
        this.filteredDocuments$ = this.selectedModelDocuments$.pipe(
            map(this.sortDocumentsByDate.bind(this, event))
        )
    }

    sortDocumentsByDate(date: string, documents: DocCatalogEntry[]) {
        return documents.sort((a, b) => {
            if (date === 'oldest') {
                return a['x-meditor'].modifiedOn < b['x-meditor'].modifiedOn
                    ? -1
                    : 1
            } else {
                return a['x-meditor'].modifiedOn > b['x-meditor'].modifiedOn
                    ? -1
                    : 1
            }
        })
    }

    

    addNewDocument(event: string) {
        this.store.dispatch(new UpdateWorkflowState(event))
        this.store.dispatch(
            new Navigate(['/document/new'], { model: this.selectedModelName })
        )
    }

    loadDocument(event: { title: string; state: string }) {
        this.store.dispatch(new UpdateWorkflowState(event.state))
        this.store.dispatch(
            new Navigate(['/document/edit'], {
                model: this.selectedModelName,
                title: event.title,
            })
        )
    }*/
}
