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
    userPrivileges: string[]
    filteredDocuments$: Observable<DocCatalogEntry[]>

    private modelName: string = ''
    private searchTerm: string = ''
    private sortBy: string = 'modifiedOn'
    private sortDir: string = 'desc'

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

        this.userPrivileges = await this.userStore.retrievePrivilegesForModel(this.modelName)

        this.updatePageTitle()
        this.filterDocuments()
    }

    searchTermChanged(searchTerm: string) {
        this.searchTerm = searchTerm
        this.filterDocuments()
    }

    // TODO: support sorting by other properties
    sortByChanged(sortDir: string) {
        this.sortDir = sortDir
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
        this.filteredDocuments$ = this.modelStore.currentModelDocuments$
            .pipe(map(this.filterDocumentsBySearchTerm.bind(this, this.searchTerm)))
            .pipe(map(this.sortDocuments.bind(this, this.sortBy, this.sortDir)))
    }

    private filterDocumentsBySearchTerm(searchTerm: string, documents: DocCatalogEntry[]) {
        return documents.filter(this.documentContainSearchTerm.bind(this, searchTerm))
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
}
