import cloneDeep from 'lodash.clonedeep'
import createError from 'http-errors'
import log from '../lib/log'
import { getDocumentsDbLegacy } from './db.legacy'

import type { Document } from './types'

const workflowRoot = 'Init'
const workflowRootEdge = { source: 'Init', target: 'Draft' }

// 1. Get the ultimate version of the model
// 2. Get pen-ultimate version of the model
// 3. Compare 'workflow' fields
// 4. Stop if workflow field did not change
// 5. Fetch old workflow and new workflow (latest versions for both)
// 6. Compute mapping:
//    edge in old workflow -> set of edges forming a path in new workflow
//    this is done by comparing shortest paths between source and target
//    in the old workflow and the new workflow
// 7. Iterate through all documents of the model
//   7.a. Iterate through state change history
//   7.b. Replace every edge (transition) according to the mapping
//   7.c. Collapse duplicate adjacent transitions
async function legacyHandleModelChanges(document: Document) {
    try {
        //* Meta(data) is a catch-all map.
        const meta: Record<string, any> = {}
        const documentsDb = await getDocumentsDbLegacy()
        //* We're hardcoding this because we know the Models model's titleProperty is 'name'.
        const { name: documentTitle } = document

        //* The limit in this query is two, but a new Models model would have no "history" (no older record sharing the same title) in the DB.
        const maybeTwoModels = await documentsDb.getModelWithMaybePrevious(
            documentTitle
        )

        //* Return early when this is either a new entry or the workflow hasn't changed.
        if (
            maybeTwoModels.length < 2 ||
            maybeTwoModels[0]?.workflow === maybeTwoModels[1]?.workflow
        ) {
            return
        }

        //* We now know there are two entries whose workflow names are not identical.
        meta.newModel = maybeTwoModels[0]
        meta.oldModel = maybeTwoModels[1]
        meta.workflows = (
            await documentsDb.getModelWorkflows(
                maybeTwoModels.map((entries: any) => entries.workflow)
            )
        ).reduce(function (accumulator: any, currentValue: any) {
            accumulator[currentValue.name] = {
                workflow: currentValue,
                paths: floydWarshallWithPathReconstruction(currentValue),
            }

            return accumulator
        }, {})
        // edgeMapping is a two-level dictionary, e.g., {Draft: {Review: {from: Draft, to: Published}}
        meta.edgeMapping = {}

        meta.workflows[meta.oldModel.workflow]?.workflow.edges.forEach(
            (oldEdge: any) => {
                computeAndAddEdgeMapping(meta, workflowRoot, oldEdge)
            }
        )

        const updateQueue = []
        const allCollectionRecords =
            await documentsDb.getAllCollectionRecordsForModel(documentTitle)

        allCollectionRecords.forEach(document => {
            var oldHistory = cloneDeep(document['x-meditor']['states'])
            var newStateHistory = []
            // console.log('Old history: ', JSON.stringify(doc['x-meditor']['states'], null, 2));
            document['x-meditor']['states'].forEach(oldEdge => {
                // Some edges might not be in the old workflow, e.g., a result of a botched import etc,
                // see if we can still compute a mapping
                if (
                    !meta.edgeMapping[oldEdge.source] ||
                    !meta.edgeMapping[oldEdge.source][oldEdge.target]
                )
                    computeAndAddEdgeMapping(meta, workflowRoot, oldEdge)
                // Discard an edge if there is no mapping
                if (
                    !meta.edgeMapping[oldEdge.source] ||
                    !meta.edgeMapping[oldEdge.source][oldEdge.target]
                )
                    return
                // Add all edges from the mapping edge chain to the history, preserving extraneous attributes
                // and discarding duplicate edges
                meta.edgeMapping[oldEdge.source][oldEdge.target].forEach(edge => {
                    var historyLast = null
                    var mappedEdge
                    if (newStateHistory.length !== 0)
                        historyLast = newStateHistory[newStateHistory.length - 1]
                    if (
                        !historyLast ||
                        !(
                            historyLast.source === edge.source &&
                            historyLast.target === edge.target
                        )
                    ) {
                        if (
                            edge.source === oldEdge.source &&
                            edge.target === oldEdge.target
                        ) {
                            // The old edge is exactly the same as the new edge, just push it as-is
                            newStateHistory.push(oldEdge)
                        } else {
                            // Otherwise, copy attributes from the old edge to the new edge
                            mappedEdge = cloneDeep(oldEdge)
                            mappedEdge.source = edge.source
                            mappedEdge.target = edge.target
                            mappedEdge.notes =
                                'Mapped from [' +
                                oldEdge.source +
                                ', ' +
                                oldEdge.target +
                                ']'
                            newStateHistory.push(mappedEdge)
                        }
                    }
                })
                return oldEdge
            })
            // If the new state history came back empty - set it to the default Init->Draft edge
            if (newStateHistory.length === 0) {
                newStateHistory = [cloneDeep(workflowRootEdge)]
                newStateHistory[0].modifiedOn = document['x-meditor']['modifiedOn']
                newStateHistory[0].notes =
                    'Failed to map old workflow to the new workflow, falling back on init edge'
            }
            // Update the document in the database
            updateQueue.push(
                documentsDb.updateHistory(
                    documentTitle,
                    document._id,
                    newStateHistory,
                    oldHistory
                )
            )
            updateQueue.push(Promise.resolve())
        })

        await Promise.all(updateQueue)

        log.info(`Done updating state history for documents in ${documentTitle}.`)
    } catch (error) {
        log.error(error)

        throw new createError.InternalServerError(
            `Updating state history for ${document.name} failed.`
        )
    }
}

// Finds a shortest path between all nodes of a given graph
// https://en.wikipedia.org/wiki/Floyd%E2%80%93Warshall_algorithm
function floydWarshallWithPathReconstruction(workflow) {
    // Creates a 2D array
    function makeArray(d1, d2) {
        var arr = new Array(d1),
            i,
            l
        for (i = 0, l = d2; i < l; i++) {
            arr[i] = new Array(d1)
        }
        return arr
    }
    var inf = 10000000 // Infinity
    var nodeIndex = {} // Maps states to indices
    var reverseNodeIndex // Maps indices back to states
    var nodeRank = {} // A dictionary containing rank of each state in topologically ordered workflow (starting from Init)
    var i, j, k
    var dist = makeArray(workflow.nodes.length, workflow.nodes.length)
    var next = makeArray(workflow.nodes.length, workflow.nodes.length)
    // let dist be a   array of minimum distances initialized to   (infinity)
    // let next be a   array of vertex indices initialized to null
    for (i = 0; i < workflow.nodes.length; i++) {
        for (j = 0; j < workflow.nodes.length; j++) {
            dist[i][j] = inf
            next[i][j] = null
        }
    }
    // Compute node lookup tables
    for (i = 0; i < workflow.nodes.length; i++) {
        nodeIndex[workflow.nodes[i].id] = i
    }
    reverseNodeIndex = Object.keys(nodeIndex).reduce(function (acc, curr) {
        acc[nodeIndex[curr]] = curr
        return acc
    }, {})
    // Initialize adjacency matrix
    workflow.edges.forEach(edge => {
        dist[nodeIndex[edge.source]][nodeIndex[edge.target]] = 1 // the weight of the edge (u,v)
        // dist[nodeIndex[edge.target]][nodeIndex[edge.source]] = 1;
        next[nodeIndex[edge.source]][nodeIndex[edge.target]] = nodeIndex[edge.target]
    })
    workflow.nodes.forEach(v => {
        dist[nodeIndex[v.id]][nodeIndex[v.id]] = 0
        next[nodeIndex[v.id]][nodeIndex[v.id]] = nodeIndex[v.id]
    })
    // Standard Floyd-Warshall implementation, O(n^3)
    for (k = 0; k < workflow.nodes.length; k++) {
        for (i = 0; i < workflow.nodes.length; i++) {
            for (j = 0; j < workflow.nodes.length; j++) {
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j]
                    next[i][j] = next[i][k]
                }
            }
        }
    }
    // Compute topological ordering of nodes starting from Init (currently unused)
    for (i = 0; i < workflow.nodes.length; i++) {
        nodeRank[reverseNodeIndex[i]] = dist[0][i]
    }
    // Return node look dictionary, matrix of distances, matrix of successors, and topological ordering ranks
    return {
        nodeIndex: nodeIndex,
        reverseNodeIndex: reverseNodeIndex,
        nodeRank: nodeRank,
        dist: dist,
        next: next,
    }
}

// A helper function that, given an shortest paths matrix in the old
// workflow and the new workflow, computes a mapping from an edge in
// the old workflow to an edge or a chain of edges in the new workflow
// The resulting mapping is stored in the meta.edgeMapping dictionary
// meta.edgeMapping[oldEdge.source][oldEdge.target] = [edge1, edge2, .., edgeN];
function computeAndAddEdgeMapping(meta, workflowRoot, oldEdge) {
    // Steps:
    // 1. Find a shortest path from Init to the old edge's source in the
    //    old workflow. The path consists of the nodes in the old workflow.
    // 2. Iterate the path back to Init node until we find a node on the path
    //    that exists in both the old and the new workflow. This node becomes
    //    the source of the mapped edge. In the worst case, we will simply
    //    retrace all the way back to Init.
    // 3. Append the target of the old edge to the path from (1) and again
    //    iterate the path back until we find a node that exists in both
    //    workflows. This will be the target of the mapped edge.
    // 4. Find the shortest path between the new source and the new target
    //    in the new workflow.
    // 5. If the path does not exists or consists of a single node (basically,
    //    source and target are the same), set the mapping to []
    // 6. Otherwise, set the mapping to a chain of edges forming the path,
    //    e.g., [Init, Draft, Published] path becomes a mapping of
    //    [{Init->Draft}, {Draft->Published}]
    var i
    var newEdge: Record<string, any> = {}
    // Compute shortest path in the old workflow between Init and old Source
    var path = getWorkflowPath(
        meta.workflows[meta.oldModel.workflow].paths,
        workflowRoot,
        oldEdge.source
    )
    // Find mapping from old Source to the new Source, basically a node that
    // exists in both workflows and appears earlier or the same in the 'approval
    // sequence' of the old workflow as the old Source
    for (i = path.length - 1; i >= 0; i--) {
        if (path[i] in meta.workflows[meta.newModel.workflow].paths.nodeIndex) {
            newEdge.source = path[i]
            break
        }
    }
    // Find mapping from old Target to the new Target, basically a node that
    // exists in both workflows and appears earlier or the same in the 'approval
    // sequence' of the old workflow as the old Target
    path.push(oldEdge.target)
    for (i = path.length - 1; i >= 0; i--) {
        if (path[i] in meta.workflows[meta.newModel.workflow].paths.nodeIndex) {
            newEdge.target = path[i]
            break
        }
    }
    // Compute shortest path in the new workflow between new Source and new Target
    path = getWorkflowPath(
        meta.workflows[meta.newModel.workflow].paths,
        newEdge.source,
        newEdge.target
    )
    // Init mapping dictionary
    if (!meta.edgeMapping[oldEdge.source]) meta.edgeMapping[oldEdge.source] = {}
    meta.edgeMapping[oldEdge.source][oldEdge.target] = []
    // Add a chain of edges on the path between the new Source and the new Target
    if (path !== null && path.length > 1) {
        for (i = 0; i < path.length - 1; i++) {
            meta.edgeMapping[oldEdge.source][oldEdge.target].push({
                source: path[i],
                target: path[i + 1],
            })
        }
    }
}

// Auxiliary procedure for finding shortest path in graph between
// two nodes using a successor matrix computed by the Floyd-Warshall
// algorithm. Modified to return a list of states, e.g.,
// [Init, Draft, Published]
function getWorkflowPath(workflowPaths, source, target) {
    var u = workflowPaths.nodeIndex[source]
    var v = workflowPaths.nodeIndex[target]
    var path = [source]
    if (workflowPaths.next[u][v] === null) return []
    while (u !== v) {
        u = workflowPaths.next[u][v]
        path.push(workflowPaths.reverseNodeIndex[u])
    }
    return path
}
export { legacyHandleModelChanges }
