import dagre from 'dagre'
import { useCallback, useEffect } from 'react'
import { MdRefresh } from 'react-icons/md'
import type { Edge, Node, NodeChange, NodePositionChange } from 'reactflow'
import ReactFlow, { Background, ControlButton, Controls } from 'reactflow'
import { useImmer } from 'use-immer'
import styles from './document-workflow.module.css'

export type WorkflowNodeType = 'input' | 'output' | 'default'

export interface WorkflowNodesAndEdges {
    nodes: Node[]
    edges: Edge[]
}

const NODE_WIDTH = 116
const NODE_HEIGHT = 36
const dagreGraph = new dagre.graphlib.Graph()

//* https://github.com/dagrejs/dagre/wiki#configuring-the-layout
dagreGraph.setGraph({
    rankdir: 'TB',
    align: 'DL',
    nodesep: NODE_HEIGHT * 2, //* Number of pixels that separate nodes horizontally in the layout.
    edgesep: NODE_HEIGHT / 3, //* Number of pixels that separate edges horizontally in the layout.
    ranksep: NODE_HEIGHT, //* Number of pixels between each rank in the layout.
})
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeIsReferencedByEdgeSource = (edges: Edge[], id: string) =>
    edges.some(edge => edge.source === id)
const nodeIsReferencedByEdgeTarget = (edges: Edge[], id: string) =>
    edges.some(edge => edge.target === id)

function filterInvalidWorkflowNodes({
    edges = [],
    nodes = [],
}: WorkflowNodesAndEdges) {
    return nodes
        .filter(node => !!node.id)
        .filter(
            node =>
                nodeIsReferencedByEdgeSource(edges, node.id) ||
                nodeIsReferencedByEdgeTarget(edges, node.id)
        )
}

function filterInvalidWorkflowEdges({
    edges = [],
    nodes = [],
}: WorkflowNodesAndEdges) {
    return edges.filter(edge => !!edge.label && !!edge.source && !!edge.target)
}

function initNodesAndEdges({
    edges = [],
    nodes = [],
}: WorkflowNodesAndEdges): WorkflowNodesAndEdges {
    const safeNodes = filterInvalidWorkflowNodes({ edges, nodes })
    const safeEdges = filterInvalidWorkflowEdges({ edges, nodes })

    //* Modify workflow nodes to match react-flow's options.
    const workflowNodes = safeNodes.map(node => {
        const id = node.id
        const isInSource = nodeIsReferencedByEdgeSource(edges, id)
        const isInTarget = nodeIsReferencedByEdgeTarget(edges, id)
        const isOnlyInSource = isInSource && !isInTarget
        const isOnlyInTarget = !isInSource && isInTarget
        const nodeType: WorkflowNodeType = isOnlyInSource
            ? 'input'
            : isOnlyInTarget
            ? 'output'
            : 'default'

        return {
            id,
            connectable: false,
            data: { label: id },
            selectable: false,
            type: nodeType,
        }
    })

    //* Remove edges without a label, then create a new node to hold a label so that the label (a node) can be moved.
    const labelNodes = safeEdges.flatMap(edge => {
        const source = edge.source
        const target = edge.target
        const sourceExistsInWorkflowNodes = workflowNodes.some(
            workflowNode => workflowNode.id === source
        )
        const targetExistsInWorkflowNodes = workflowNodes.some(
            workflowNode => workflowNode.id === target
        )
        const isValid = sourceExistsInWorkflowNodes && targetExistsInWorkflowNodes

        return isValid
            ? [
                  {
                      __typename: null,
                      className: `${styles.workflow} ${styles.label}`,
                      connectable: false,
                      data: { label: edge.label, isLabelNode: true },
                      id: `${source} to ${target}`,
                      selectable: false,
                  },
              ]
            : []
    })

    //* Create two edges from the list of current edges, pointing the first from the original source to the new label node, and the second from the new label node to the original target node.
    const workflowEdges = safeEdges.flatMap(edge => {
        const source = edge.source
        const target = edge.target
        const idRef = `${source} to ${target}`
        const label = null //* Label nodes, not edges, now contain the label.
        const type = 'smoothstep'
        const idRefExistsInLabelNodes = labelNodes.some(
            labelNode => labelNode.id === idRef
        )
        const sourceExistsInWorkflowNodes = workflowNodes.some(
            workflowNode => workflowNode.id === source
        )
        const targetExistsInWorkflowNodes = workflowNodes.some(
            workflowNode => workflowNode.id === target
        )
        const isValid =
            idRefExistsInLabelNodes &&
            sourceExistsInWorkflowNodes &&
            targetExistsInWorkflowNodes

        return isValid
            ? [
                  {
                      id: `${idRef} First Edge`,
                      label,
                      source,
                      target: idRef,
                      type,
                  },
                  {
                      arrowHeadType: 'arrowclosed',
                      id: `${idRef} Second Edge`,
                      label,
                      source: idRef,
                      target,
                      type,
                  },
              ]
            : []
    })

    const workflowAndLabelNodes = [...workflowNodes, ...labelNodes]

    workflowAndLabelNodes.forEach(node => {
        dagreGraph.setNode(node.id, {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        })
    })

    workflowEdges.forEach(edge => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    return {
        nodes: workflowAndLabelNodes.map(node => ({
            ...node,
            position: dagreGraph.node(node.id),
        })),
        edges: workflowEdges,
    }
}

const DocumentWorkflow = ({ workflow }) => {
    //* `useImmer` prevents accidental state mutation (though in this case a shallow clone would work fine). Unlike cloneDeep, allows for memoization (https://github.com/immerjs/immer/issues/619).
    const [elements, setElements] = useImmer<WorkflowNodesAndEdges>({
        nodes: [],
        edges: [],
    })

    const workflowElements: WorkflowNodesAndEdges = {
        edges: workflow?.edges,
        nodes: workflow?.nodes,
    }

    const initNodesAndEdgesMemoized = useCallback(
        workflowElements => initNodesAndEdges(workflowElements),
        [workflowElements]
    )

    useEffect(() => {
        const elements = initNodesAndEdgesMemoized(workflowElements)

        setElements(elements)
    }, [workflow])

    function handleNodeChanges(changes: NodeChange[]) {
        const { edges, nodes } = elements
        //* A NodeChange could be many things, but we're only interested in dragging position changes.
        const positionChanges = changes.filter(change => {
            return change.type === 'position' && change.dragging === true
        })

        //* In practice, there seems to be only one change in the NodeChange[], but loop anyway.
        ;(positionChanges as NodePositionChange[]).forEach(positionChange => {
            const changingNode = nodes.find(node => {
                return node.id === positionChange.id
            })

            const notChangingNodes = nodes.filter(node => {
                return node.id !== positionChange.id
            })

            changingNode.position.x = positionChange.position.x
            changingNode.position.y = positionChange.position.y

            setElements({ edges, nodes: [...notChangingNodes, changingNode] })
        })
    }

    return (
        <>
            <p className="h4 text-muted">{workflow?.name}</p>

            <ReactFlow
                nodes={elements.nodes}
                edges={elements.edges}
                nodeExtent={[
                    [0, 0],
                    [768, 1920],
                ]}
                onNodesChange={handleNodeChanges}
            >
                <Controls className={`${styles.workflow} ${styles.controls}`}>
                    <ControlButton
                        onClick={() =>
                            setElements(initNodesAndEdgesMemoized(workflowElements))
                        }
                    >
                        <span className="sr-only">Refresh Workflow Layout</span>
                        <MdRefresh
                            className={`${styles.workflow} ${styles.refreshIcon}`}
                        />
                    </ControlButton>
                </Controls>
                <Background color="#aaa" gap={16} />
            </ReactFlow>
        </>
    )
}

export default DocumentWorkflow
