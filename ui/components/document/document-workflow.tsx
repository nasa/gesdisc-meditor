import dagre from 'dagre'
import React, { useCallback, useEffect } from 'react'
import ReactFlow, {
    Background,
    ControlButton,
    Controls,
    Elements,
    isNode,
} from 'react-flow-renderer'
import { MdRefresh } from 'react-icons/md'
import { useImmer } from 'use-immer'
import styles from './document-workflow.module.css'

export type WorkflowNodeType = 'input' | 'output' | 'default'

export interface WorkflowNode {
    [key: string]: any
    __typename: 'WorkflowNode'
    id: string
}

export interface WorkflowEdge {
    [key: string]: any
    __typename: 'WorkflowEdge'
    label: string
    notify: boolean
    role: string
    source: string
    target: string
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

const nodeIsReferencedByEdgeSource = (edges: WorkflowEdge[], id: string) =>
    edges.some(edge => edge.source === id)
const nodeIsReferencedByEdgeTarget = (edges: WorkflowEdge[], id: string) =>
    edges.some(edge => edge.target === id)

function filterInvalidWorkflowNodes({
    edges = [],
    nodes = [],
}: {
    edges: WorkflowEdge[]
    nodes: WorkflowNode[]
}) {
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
}: {
    edges: WorkflowEdge[]
    nodes: WorkflowNode[]
}) {
    return edges.filter(edge => !!edge.label && !!edge.source && !!edge.target)
}

function initNodesAndEdges({
    edges = [],
    nodes = [],
}: {
    edges: WorkflowEdge[]
    nodes: WorkflowNode[]
}): Elements {
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

    return [...workflowNodes, ...labelNodes, ...workflowEdges] as Elements
}

function layoutDagreGraph(elements: Elements) {
    elements.forEach(element => {
        if (isNode(element)) {
            dagreGraph.setNode(element.id, {
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
            })
        } else {
            dagreGraph.setEdge(element.source, element.target)
        }
    })

    dagre.layout(dagreGraph)

    return elements.map(element => {
        if (isNode(element)) {
            const { x, y } = dagreGraph.node(element.id)

            element.position = { x, y }
        }

        return element
    })
}

const DocumentWorkflow = ({ workflow }) => {
    //* `useImmer` prevents accidental state mutation (though in this case a shallow clone would work fine). Unlike cloneDeep, allows for memoization (https://github.com/immerjs/immer/issues/619).
    const [elements, setElements] = useImmer<Elements>([])
    const workflowElements: {
        edges: WorkflowEdge[]
        nodes: WorkflowNode[]
    } = {
        edges: workflow?.edges,
        nodes: workflow?.nodes,
    }
    const initNodesAndEdgesMemoized = useCallback(
        workflowElements => layoutDagreGraph(initNodesAndEdges(workflowElements)),
        [workflowElements]
    )

    useEffect(() => {
        const elements = initNodesAndEdgesMemoized(workflowElements)

        setElements(elements)
    }, [workflow])

    return (
        <>
            <p className="h4 text-muted">{workflow?.name}</p>
            <ReactFlow
                elements={elements}
                nodeExtent={[
                    [0, 0],
                    [768, 1920],
                ]}
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
