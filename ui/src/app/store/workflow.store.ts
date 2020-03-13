import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
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
    private readonly _currentWorkflow = new BehaviorSubject<Workflow | undefined>(undefined)
    private readonly _currentEdges = new BehaviorSubject<Edge[]>([INIT_EDGE])
    private readonly _currentNode = new BehaviorSubject<Node>(INIT_NODE)
    private readonly _currentNodePrivileges = new BehaviorSubject<Privilege[] | undefined>([])

    readonly currentWorkflow$ = this._currentWorkflow.asObservable()
    readonly currentEdges$ = this._currentEdges.asObservable()
    readonly currentNode$ = this._currentNode.asObservable()
    readonly currentNodePrivileges$ = this._currentNodePrivileges.asObservable()

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
        this._currentNodePrivileges.next(currentNode[NODE_PRIVILEGES_KEY])
    }

    get currentNodePrivileges(): Privilege[] | undefined {
        return this._currentNodePrivileges.getValue()
    }

    constructor(private service: DefaultService) {
        //
    }

    /**
     * retrieves a workflow by title
     * @param workflowTitle
     */
    async fetchWorkflow(workflowTitle: string) {
        const workflow = await this.service.getDocument(WORKFLOW_MODEL_NAME, workflowTitle).toPromise()

        this.currentWorkflow = workflow.doc

        // TODO: fix these using typescript ?
        if (this.currentWorkflow && this.currentWorkflow.edges) {
            this.currentEdges = this.findInitialEdges(this.currentWorkflow.edges)
        }

        if (this.currentWorkflow && this.currentWorkflow.nodes) {
            this.currentNode = this.currentWorkflow.nodes[0]
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
