import Alert from 'react-bootstrap/Alert'
import styles from './search-status-bar.module.css'
import Button from 'react-bootstrap/Button'
import { MdAdd } from 'react-icons/md'
import { useRouter } from 'next/router'
import pickby from 'lodash.pickby'
import SearchFilter from './search-filter'

const SearchStatusBar = ({
    model,
    currentPage,
    itemsPerPage,
    totalDocumentCount = 0,
    onAddNew,
    user,
    searchOptions,
    onFilterChange,
}) => {
    const offset = currentPage * itemsPerPage
    const router = useRouter()
    const { modelName } = router.query

    const schema = JSON.parse(model?.schema || '{}')
    const layout = JSON.parse(model?.uiSchema || model?.layout || '{}')

    const states =
        model.workflow.nodes
            ?.filter(node => node.id !== 'Init' && node.id !== 'Deleted')
            .map(node => node.id)
            .sort() || []

    // find fields in the layout that are marked as filters
    let filterFields = []

    try {
        filterFields = pickby(layout, field => 'ui:filter' in field)
    } catch (err) {}

    // retrieve the schema information for the field
    Object.keys(filterFields).forEach(field => {
        filterFields[field].schema = schema?.properties?.[field]
    })

    const currentPrivileges = model.workflow
        ? user.privilegesForModelAndWorkflowNode(
              modelName,
              model.workflow.currentNode
          )
        : []
    const currentEdges =
        model.workflow.currentEdges?.filter(edge => {
            return user.rolesForModel(modelName).includes(edge.role)
        }) || []

    if (!totalDocumentCount) {
        return (
            <Alert variant="info">
                No documents found.
                {currentPrivileges.includes('create') && currentEdges.length && (
                    <Button
                        variant="secondary"
                        onClick={onAddNew}
                        style={{ marginLeft: 20 }}
                    >
                        <MdAdd />
                        {currentEdges[0].label}
                    </Button>
                )}
            </Alert>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.count}>
                Showing {offset + 1} -{' '}
                {offset + itemsPerPage > totalDocumentCount
                    ? totalDocumentCount
                    : offset + itemsPerPage}{' '}
                of {totalDocumentCount} {modelName} documents
            </div>

            <div className={styles.actions}>
                {Object.keys(filterFields).map(field => (
                    <SearchFilter
                        key={field}
                        label={field}
                        field={filterFields[field]}
                        value={searchOptions?.filters?.[field] || ''}
                        onChange={(field, value) => onFilterChange(field, value)}
                    />
                ))}

                <div className={styles.action}>
                    <label>
                        Filter by:
                        <select
                            className="form-control"
                            value={searchOptions.filter}
                            onChange={e => onFilterChange(e.target.value)}
                        >
                            <option value=""></option>

                            {states.map(state => (
                                <option key={state} value={`state:${state}`}>
                                    {state}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {currentPrivileges.includes('create') && (
                    <div className={styles.action}>
                        {currentEdges.length && (
                            <Button variant="secondary" onClick={onAddNew}>
                                <MdAdd />
                                {currentEdges[0].label}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchStatusBar
