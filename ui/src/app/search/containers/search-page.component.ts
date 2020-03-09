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

@Component({
    selector: 'med-search-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './search-page.component.html',
    styles: [``],
})
export class SearchPageComponent implements OnInit {
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
    selectedModelDocumentStates: string[]
    searchTerm: string
    filterBy: string
    sortBy: string

    constructor(
        private store: Store,
        private titleService: Title,
        private router: Router,
        private applicationRef: ApplicationRef,
        private zone: NgZone
    ) {
        forceTickOnRender(router, applicationRef, zone)
    }

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

    selectedModelDocumentsChanged(documents: DocCatalogEntry[]) {
        this.selectedModelDocumentStates = documents
            .map((document: DocCatalogEntry) => document['x-meditor'].state)
            .filter((state, index, states) => states.indexOf(state) === index)
            .sort()

        this.filteredDocuments$ = this.selectedModelDocuments$
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm
        this.filterDocuments()
    }

    sortByChanged(sortBy: string) {
        this.sortBy = sortBy
        this.filterDocuments()
    }

    filterByChanged(filterBy: string) {
        this.filterBy = filterBy
        this.filterDocuments()
    }

    filterDocuments() {
        this.filteredDocuments$ = this.selectedModelDocuments$.pipe(
            map(this.sortDocumentsByDate.bind(this, this.sortBy)),
            map(this.filterDocumentsBySearchTerm.bind(this, this.searchTerm)),
            map(this.filterDocumentsByState.bind(this, this.filterBy))
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

    sortDocumentsByDate(date: string, documents: DocCatalogEntry[]) {
        if (!date) return documents

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

    filterDocumentsByState(state: string, documents: DocCatalogEntry[]) {
        if (!state) return documents

        return documents.filter((document: DocCatalogEntry) => {
            return document['x-meditor'].state === state
        })
    }

    selectAndChange(modelName: any) {
        this.store.dispatch(new GetModel({ name: modelName }))
        this.store.dispatch(new Navigate(['/search'], { model: modelName }))
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
    }
}
