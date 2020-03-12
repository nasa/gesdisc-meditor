import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { map, pluck } from 'rxjs/operators'
import { pluck as _pluck, where } from 'underscore'
import { Workflow, Edge, Privilege, Node } from '../service/model/models'
import { DefaultService } from '../service/api/default.service'

const WORKFLOW_MODEL_NAME = 'Workflows'
const NODE_PRIVILEGES_KEY = 'privileges'
const EDGE_SOURCE_KEY = 'source'
const EDGE_TARGET_KEY = 'target'

// TODO: this shouldn't be in the UI
const INIT_EDGE = {
    source: 'Init',
    target: 'Draft',
    label: 'Add New',
}

// TODO: this shouldn't be in the UI
const INIT_NODE = {
    id: 'Init',
    privileges: [],
}

@Injectable({ providedIn: 'root' })
export class WorkflowStore {
    private readonly _currentWorkflow = new BehaviorSubject<
        Workflow | undefined
    >(undefined)
    private readonly _currentEdges = new BehaviorSubject<Edge[]>([INIT_EDGE])
    private readonly _currentNode = new BehaviorSubject<Node>(INIT_NODE)

    readonly currentWorkflow$ = this._currentWorkflow.asObservable()
    readonly currentEdges$ = this._currentEdges.asObservable()
    readonly currentNode$ = this._currentNode.asObservable()
    readonly currentNodePrivileges$ = this.currentNode$.pipe(
        pluck(NODE_PRIVILEGES_KEY)
    )

    get currentWorkflow(): Workflow | undefined {
        return this._currentWorkflow.getValue()
    }

    set currentWorkflow(currentWorkflow: Workflow | undefined) {
        this._currentWorkflow.next(currentWorkflow)
    }

    get currentEdges(): Edge[] {
        return this._currentEdges.getValue()
    }

    set currentEdges(currentEdges: Edge[]) {
        this._currentEdges.next(currentEdges)
    }

    get currentNode(): Node {
        return this._currentNode.getValue()
    }

    set currentNode(currentNode: Node) {
        this._currentNode.next(currentNode)
    }

    constructor(private service: DefaultService) {
        //
    }

    /**
     * retrieves a workflow by title
     * @param workflowTitle
     */
    async fetchWorkflow(workflowTitle: string) {
        const workflow = await this.service
            .getDocument(WORKFLOW_MODEL_NAME, workflowTitle)
            .toPromise()
        this.currentWorkflow = workflow.doc

        // TODO: fix this using typescript ?
        if (this.currentWorkflow && this.currentWorkflow.edges) {
            this.currentEdges = this.findInitialEdges(
                this.currentWorkflow.edges
            )
        }

        return this.currentWorkflow
    }

    private findInitialEdges(edges: Edge[]) {
        const sources = _pluck(edges, EDGE_SOURCE_KEY)
        const targets = _pluck(edges, EDGE_TARGET_KEY)
        const initEdge = sources.filter(e => !targets.includes(e))[0]
        return where(edges, { source: initEdge }) as Edge[]
    }
}
