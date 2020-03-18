import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { map } from 'rxjs/operators'
import { Model, ModelCatalogEntry, DocCatalogEntry } from '../service/model/models'
import { DefaultService } from '../service/api/default.service'
import { NotificationStore } from './notification.store'

@Injectable({ providedIn: 'root' })
export class ModelStore {
    private readonly _models = new BehaviorSubject<ModelCatalogEntry[]>([])
    private readonly _currentModel = new BehaviorSubject<Model | undefined>(undefined)
    private readonly _currentModelName = new BehaviorSubject<string>('')
    private readonly _currentModelDocuments = new BehaviorSubject<DocCatalogEntry[]>([])

    readonly models$ = this._models.asObservable().pipe(map(models => models.sort(this.sortModels)))
    readonly categories$ = this.models$.pipe(map(models => this.getCategoriesFromModels(models)))
    readonly currentModel$ = this._currentModel.asObservable()
    readonly currentModelName$ = this._currentModelName.asObservable()
    readonly currentModelDocuments$ = this._currentModelDocuments
        .asObservable()
        .pipe(map(documents => documents.sort(this.sortDocuments)))

    currentModelDocumentsSearchTerm: string
    currentModelDocumentsSortBy: string
    currentModelDocumentsSortDir: 'asc' | 'desc'

    constructor(private service: DefaultService, private notificationStore: NotificationStore) {
        //
    }

    get models(): ModelCatalogEntry[] {
        return this._models.getValue()
    }

    set models(models: ModelCatalogEntry[]) {
        this._models.next(models)
    }

    get currentModel(): Model | undefined {
        return this._currentModel.getValue()
    }

    set currentModel(currentModel: Model | undefined) {
        this._currentModel.next(currentModel)
        this.currentModelName = currentModel ? currentModel.name : ''
        this.currentModelDocumentsSearchTerm = ''
        this.currentModelDocumentsSortBy = 'modifiedOn'
        this.currentModelDocumentsSortDir = 'desc'
    }

    get currentModelName(): string {
        return this._currentModelName.getValue()
    }

    set currentModelName(currentModelName: string) {
        this._currentModelName.next(currentModelName || '')
    }

    get currentModelDocuments(): DocCatalogEntry[] {
        return this._currentModelDocuments.getValue()
    }

    set currentModelDocuments(documents: DocCatalogEntry[]) {
        this._currentModelDocuments.next(documents)
    }

    /**
     * retrieves all of the Models from the API service
     */
    async fetchModels(useCache: boolean = true) {
        if (useCache && this.models.length) {
            return this.models
        }

        this.models = await this.service.listModels().toPromise()
        return this.models
    }

    /**
     * retrieves a model by name
     * @param name
     */
    async fetchModel(modelName: string) {
        if (modelName !== this.currentModelName) {
            this.currentModel = await this.service.getModel(modelName).toPromise()
        }

        return this.currentModel
    }

    /**
     * retrieves documents associated with a model
     * @param modelName
     */
    async fetchModelDocuments(modelName: string) {
        // clear out any existing documents
        this.currentModelDocuments = []

        this.notificationStore.loading = true

        this.currentModelDocuments = await this.service.listDocuments(modelName).toPromise()

        this.notificationStore.loading = false

        return this.currentModelDocuments
    }

    /**
     * sorts models alphabetically by category
     * @param modelA
     * @param modelB
     */
    private sortModels(modelA: ModelCatalogEntry, modelB: ModelCatalogEntry) {
        // sort by category first
        if (modelA.category < modelB.category) return 1
        if (modelA.category > modelB.category) return -1

        // sort by name, alphabetically
        if (modelA.name < modelB.name) return -1
        if (modelA.name > modelB.name) return 1

        return 0
    }

    /**
     * sorts documents by date desc
     * @param documentA
     * @param documentB
     */
    private sortDocuments(documentA: DocCatalogEntry, documentB: DocCatalogEntry) {
        if (
            !(
                documentA &&
                documentA.xMeditor &&
                documentA.xMeditor.modifiedOn &&
                documentB &&
                documentB.xMeditor &&
                documentB.xMeditor.modifiedOn
            )
        ) {
            return 0
        }

        let modifiedDateA = documentA.xMeditor.modifiedOn
        let modifiedDateB = documentB.xMeditor.modifiedOn

        if (!modifiedDateA || !modifiedDateB) return 0
        if (modifiedDateA > modifiedDateB) return -1
        if (modifiedDateA < modifiedDateB) return 1
        return 0
    }

    /**
     * will retrieve the unique categories from an array of Models
     * @param models
     */
    private getCategoriesFromModels(models: Array<ModelCatalogEntry>) {
        return models
            .map(model => model.category) // return just the categories
            .filter((item, index, array) => array.indexOf(item) === index) // remove duplicates
    }
}
