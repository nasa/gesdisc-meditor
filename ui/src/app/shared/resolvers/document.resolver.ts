import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Resolve } from '@angular/router'
import { DocumentStore } from '../../store/'

@Injectable()
export class DocumentResolver implements Resolve<void> {
    constructor(private documentStore: DocumentStore) {}

    async resolve(route: ActivatedRouteSnapshot) {
        const modelName = route.queryParams.model
        const documentTitle = route.queryParams.title

        await this.documentStore.fetchDocument(modelName, documentTitle)
    }
}
