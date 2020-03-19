import { Component, ChangeDetectionStrategy } from '@angular/core'
import { Title } from '@angular/platform-browser'

import { AppStore, ModelStore, WorkflowStore, UserStore } from '../../store/'
import { DocCatalogEntry } from '../../service'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Router } from '@angular/router'

@Component({
    selector: 'med-search-page',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './search-page.component.html',
    styles: [``],
})
export class SearchPageComponent {
    filteredDocuments$: Observable<DocCatalogEntry[]>

    modelName: string = ''
    selectedModelDocumentStates: string[]
    searchTerm: string = ''
    sortBy: string = 'modifiedOn'
    sortDir: 'asc' | 'desc' = 'desc'
    filterBy: string = ''

    constructor(
        public modelStore: ModelStore,
        public workflowStore: WorkflowStore,
        public userStore: UserStore,
        private appStore: AppStore,
        private titleService: Title,
        private router: Router
    ) {}

    async ngOnInit() {
        if (this.modelStore.currentModel && this.modelStore.currentModel.name) {
            this.modelName = this.modelStore.currentModel.name
        }

        this.loadFiltersFromStore()
        await this.modelStore.fetchModelDocuments(this.modelName)
        this.updatePageTitle()
        this.filterDocuments()
        this.updateSelectedModelDocumentStates()
    }

    updateSelectedModelDocumentStates() {
        this.selectedModelDocumentStates = this.modelStore.currentModelDocuments
            // @ts-ignore
            .map((document: DocCatalogEntry) => document['x-meditor'].state)
            .filter((state, index, states) => states.indexOf(state) === index)
            .sort()
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm
        this.filterDocuments()
    }

    // TODO: support sorting by other properties
    sortByChanged(sortDir: 'asc' | 'desc') {
        this.sortDir = sortDir
        this.filterDocuments()
    }

    filterByChanged(filterBy: string) {
        this.filterBy = filterBy
        this.filterDocuments()
    }

    updatePageTitle() {
        this.titleService.setTitle(`${this.modelName} | mEditor`)
    }

    changeModel(model: string) {
        this.appStore.navigate('/search', {
            queryParams: { model },
            reloadSameRoute: true,
        })
    }

    private filterDocuments() {
        this.saveFiltersInStore()

        this.filteredDocuments$ = this.modelStore.currentModelDocuments$
            .pipe(map(this.filterDocumentsBySearchTerm.bind(this, this.searchTerm)))
            .pipe(map(this.filterDocumentsByState.bind(this, this.filterBy)))
            .pipe(map(this.sortDocuments.bind(this, this.sortBy, this.sortDir)))
    }

    private filterDocumentsBySearchTerm(searchTerm: string, documents: DocCatalogEntry[]) {
        return documents.filter(this.documentContainSearchTerm.bind(this, searchTerm))
    }

    private filterDocumentsByState(state: string, documents: DocCatalogEntry[]) {
        if (!state || state === '') return documents

        return documents.filter((document: DocCatalogEntry) => {
            // @ts-ignore
            return document['x-meditor'].state === state
        })
    }

    private documentContainSearchTerm(searchTerm: string, document: DocCatalogEntry) {
        if (!document.title) return false
        return document.title.search(new RegExp(searchTerm, 'i')) !== -1
    }

    private sortDocuments(sortBy: string, sortDir: string, documents: DocCatalogEntry[]) {
        return documents.sort((a, b) => {
            // @ts-ignore
            let documentA = a['x-meditor']
            // @ts-ignore
            let documentB = b['x-meditor']

            if (documentA[sortBy] < documentB[sortBy]) return sortDir === 'asc' ? -1 : 1
            if (documentA[sortBy] > documentB[sortBy]) return sortDir === 'asc' ? 1 : -1
            return 0
        })
    }

    addNewDocument(state: string) {
        this.workflowStore.updateWorkflowState(state)

        this.router.navigate(['/document/new'], {
            queryParams: {
                model: this.modelName,
            },
        })
    }

    loadDocument(event: { title: string; state: string }) {
        this.workflowStore.updateWorkflowState(event.state)

        this.router.navigate(['/document/edit'], {
            queryParams: {
                model: this.modelName,
                title: event.title,
            },
        })
    }

    private loadFiltersFromStore() {
        this.searchTerm = this.modelStore.currentModelDocumentsSearchTerm
        this.sortBy = this.modelStore.currentModelDocumentsSortBy
        this.sortDir = this.modelStore.currentModelDocumentsSortDir
        this.filterBy = this.modelStore.currentModelDocumentsFilterBy
    }

    private saveFiltersInStore() {
        this.modelStore.currentModelDocumentsSearchTerm = this.searchTerm
        this.modelStore.currentModelDocumentsSortBy = this.sortBy
        this.modelStore.currentModelDocumentsSortDir = this.sortDir
        this.modelStore.currentModelDocumentsFilterBy = this.filterBy
    }
}
