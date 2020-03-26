import { Injectable } from '@angular/core'
import { Resolve } from '@angular/router'
import { ModelStore } from '../../store/'

@Injectable()
export class ModelsResolver implements Resolve<void> {
    constructor(private modelStore: ModelStore) {}

    async resolve() {
        await this.modelStore.fetchModels()
    }
}
