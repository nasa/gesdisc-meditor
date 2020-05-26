import Alert from 'react-bootstrap/Alert'
import { useQuery } from '@apollo/react-hooks'
import styles from './search-status-bar.module.css'
import Button from 'react-bootstrap/Button'
import { MdAdd } from 'react-icons/md'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../../lib/apollo'
import { useContext } from 'react'
import { AppContext } from '../app-store'

const QUERY = gql`
    query getModel($modelName: String!) {
        model(modelName: $modelName) {
            name
            workflow {
                currentNode {
                    privileges {
                        role
                        privilege
                    }
                }
                currentEdges {
                    role
                    label
                }
            }
        }
    }
`

const SearchStatusBar = ({
    documentCount = 0,
    totalDocumentCount = 0,
    onAddNew,
    documentStates = [],
    user,
}) => {
    const router = useRouter()
    const { modelName } = router.query

    const { sortDir, setSortDir, filterBy, setFilterBy } = useContext(AppContext)

    const { error, data } = useQuery(QUERY, {
        variables: { modelName },
        fetchPolicy: 'cache-and-network',
    })

    const currentPrivileges = data?.model?.workflow ? user.privilegesForModelAndWorkflowNode(modelName, data.model.workflow.currentNode) : []
    const currentEdges = data?.model?.workflow?.currentEdges?.filter(edge => {
        return user.rolesForModel(modelName).includes(edge.role)
    }) || []

    if (error) {
        // something went wrong, but there's nowhere to show the error, log it
        console.error(error)
    }

    if (!totalDocumentCount) {
        return (
            <Alert variant="info">
                No documents found.

                {(currentPrivileges.includes('create') && currentEdges.length) && (
                    <Button variant="secondary" onClick={onAddNew} style={{ marginLeft: 20 }}>
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
                Showing 1 - {documentCount} of {totalDocumentCount} {modelName} documents
            </div>

            <div className={styles.actions}>
                <div className={styles.action}>
                    <label>
                        Filter by:
                        <select
                            className="form-control"
                            value={filterBy}
                            onChange={e => setFilterBy(e.target.value)}
                        >
                            <option value=""></option>

                            <optgroup label="State">
                                {documentStates.map(state => (
                                    <option key={state} value={state}>
                                        {state}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </label>
                </div>

                <div className={styles.action}>
                    <label>
                        Sort by:
                        <select
                            className="form-control"
                            value={sortDir}
                            onChange={e => setSortDir(e.target.value)}
                        >
                            <option value="asc">Oldest</option>
                            <option value="desc">Newest</option>
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

export default withApollo({ ssr: true })(SearchStatusBar)
