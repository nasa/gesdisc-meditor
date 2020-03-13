import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve } from '@angular/router'
import { ModelStore } from '../model.store'
import { WorkflowStore } from '../workflow.store'

@Injectable()
export class ModelResolver implements Resolve<void> {
    constructor(private modelStore: ModelStore, private workflowStore: WorkflowStore) {}

    async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const modelName = route.queryParams.model
        const model = await this.modelStore.fetchModel(modelName)

        if (!model) throw new Error('Model not found: ' + modelName)
        if (!model.workflow) throw new Error('Model has no workflow: ' + modelName)

        const workflow = await this.workflowStore.fetchWorkflow(model.workflow)

        if (!workflow) throw new Error('Workflow does not exist: ' + model.workflow)
        if (!workflow.nodes) throw new Error('Current workflow has no nodes')
    }
}
