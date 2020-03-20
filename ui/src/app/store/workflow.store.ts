import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable } from 'rxjs'
import * as _ from 'underscore'
import { Workflow, Edge, Privilege, Node } from '../service/model/models'
import { DefaultService } from '../service/api/default.service'
import { UserStore } from './user.store'
import { ModelStore } from './model.store'

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
    private readonly _currentNodeUserPrivileges = new BehaviorSubject<string[] | undefined>([])

    readonly currentWorkflow$ = this._currentWorkflow.asObservable()
    readonly currentEdges$ = this._currentEdges.asObservable()
    readonly currentNode$ = this._currentNode.asObservable()
    readonly currentNodePrivileges$ = this._currentNodePrivileges.asObservable()
    readonly currentNodeUserPrivileges$ = this._currentNodeUserPrivileges.asObservable()

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

        let privileges = currentNode[NODE_PRIVILEGES_KEY]

        this._currentNodePrivileges.next(privileges)

        if (!privileges) return

        let userPrivileges = this.userStore.retrievePrivilegesForModel(this.modelStore.currentModelName, privileges)

        this._currentNodeUserPrivileges.next(userPrivileges)
    }

    get currentNodePrivileges(): Privilege[] | undefined {
        return this._currentNodePrivileges.getValue()
    }

    get currentNodeUserPrivileges(): string[] | undefined {
        return this._currentNodeUserPrivileges.getValue()
    }

    constructor(private service: DefaultService, private userStore: UserStore, private modelStore: ModelStore) {
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

    async updateWorkflowState(nodeId?: string) {
        let node: Node | undefined
        let edges: Edge[]

        // handle incorrectly configured workflow first

        if (!this.currentWorkflow) {
            throw new Error('No active workflow was found')
        }

        if (!this.currentWorkflow.nodes || !this.currentWorkflow.nodes.length) {
            throw new Error('Workflow does not have any nodes')
        }

        if (!this.currentWorkflow.edges || !this.currentWorkflow.edges.length) {
            throw new Error('Workflow does not have any edges')
        }

        if (nodeId) {
            // find node and edges for a particular node
            node = this.currentWorkflow.nodes.find(n => n.id === nodeId)
            edges = this.currentWorkflow.edges.filter(e => e.source === nodeId)
        } else {
            // find init node and it's edges
            node = this.currentWorkflow.nodes && this.currentWorkflow.nodes[0]
            edges = this.findInitialEdges(this.currentWorkflow.edges)
        }

        if (!node) {
            throw new Error('Failed to update workflow state, node not found ' + nodeId)
        }

        this.currentNode = node
        this.currentEdges = edges
    }

    private findInitialEdges(edges: Edge[]) {
        if (!edges) return []
        const sources = _.pluck(edges, EDGE_SOURCE_KEY)
        const targets = _.pluck(edges, EDGE_TARGET_KEY)
        const initEdge = sources.filter(e => !targets.includes(e))[0]
        return _.where(edges, { source: initEdge }) as Edge[]
    }
}
