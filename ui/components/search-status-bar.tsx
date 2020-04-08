import { useQuery } from '@apollo/react-hooks'
import styles from './search-status-bar.module.css'
import Button from 'react-bootstrap/Button'
import { MdAdd } from 'react-icons/md'
import { useRouter } from 'next/router'
import gql from 'graphql-tag'
import { withApollo } from '../lib/apollo'

const QUERY = gql`
    query getModel($modelName: String!) {
        model(modelName: $modelName) {
            name
            workflow {
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
    sortDir,
    onSortDirChange,
    documentStates = [],
    filterBy,
    onFilterByChange,
    user,
}) => {
    const router = useRouter()
    const { modelName } = router.query

    const { loading, error, data } = useQuery(QUERY, {
        variables: { modelName },
        fetchPolicy: 'cache-and-network',
    })

    const currentEdges = data?.model?.workflow?.currentEdges?.filter(edge => {
        return user.rolesForModel(modelName).includes(edge.role)
    }) || []

    if (error) {
        console.error(error)
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
                            onChange={e => onFilterByChange(e.target.value)}
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
                            onChange={e => onSortDirChange(e.target.value)}
                        >
                            <option value="asc">Oldest</option>
                            <option value="desc">Newest</option>
                        </select>
                    </label>
                </div>

                {currentEdges.map(edge => (
                    <div className={styles.action} key={edge.label}>
                        <Button variant="secondary" onClick={onAddNew}>
                            <MdAdd />
                            {edge.label}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default withApollo({ ssr: true })(SearchStatusBar)
