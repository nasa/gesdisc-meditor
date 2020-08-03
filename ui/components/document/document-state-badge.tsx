import gql from 'graphql-tag'
import Badge from 'react-bootstrap/Badge'
import Popover from 'react-bootstrap/Popover'
import Overlay from 'react-bootstrap/Overlay'
import { useLazyQuery } from '@apollo/react-hooks'
import styles from './document-state-badge.module.css'
import { useEffect, useState, useRef } from 'react'
import StateBadge from '../state-badge'
import omitBy from 'lodash.omitby'

const QUERY = gql`
    query getDocument($modelName: String!, $title: String!, $version: String) {
        document(modelName: $modelName, title: $title, version: $version) {
            title
            publicationStatus {
                url
                message
                target
                statusCode
                publishedOn
                failedOn
            }
        }
    }
`

const DocumentStateBadge = ({
    document,
    modelName = null, // required if showPublicationStatus is true
    version = null,
    showPublicationStatus = false,
}) => {
    const badgeRef = useRef(null)
    const [showPublicationStatusOverlay, setShowPublicationStatusOverlay] = useState(false)

    const [loadDocument, response] = useLazyQuery(QUERY, {
        fetchPolicy: 'network-only',
    })

    const publicationStatus = response?.data?.document?.publicationStatus
    const isPublishing = publicationStatus && publicationStatus.length <= 0

    // older documents may have an invalid publication status format, filter these out
    const publicationStatuses = publicationStatus?.filter((status) => {
        // filter out unneeded keys (null values and typename)
        let testObj = omitBy(status, (value) => !value)
        delete testObj.__typename

        return Object.keys(testObj).length > 0
    })

    // if showing publication status, query for it
    useEffect(() => {
        if (!showPublicationStatus) return

        // load the publication status
        loadDocument({
            variables: { modelName, title: document.title, version },
        })
    }, [showPublicationStatus])

    function canShowPublicationStatusOverlay() {
        return showPublicationStatus && publicationStatuses?.length
    }

    return (
        <>
            <span
                ref={badgeRef}
                className={`${styles.badge} ${canShowPublicationStatusOverlay() ? styles.badgeHoverable : ''}`}
                onMouseEnter={() => canShowPublicationStatusOverlay() && setShowPublicationStatusOverlay(true)}
                onMouseLeave={() => setShowPublicationStatusOverlay(false)}
            >
                <StateBadge>
                    {document?.state}

                    <Badge
                        variant={publicationStatuses?.filter((status) => status.failedOn).length ? 'danger' : 'primary'}
                        className={styles.publicationBadge}
                    >
                        {publicationStatuses?.length}
                    </Badge>
                </StateBadge>
            </span>

            <Overlay target={badgeRef.current} show={showPublicationStatusOverlay} placement="bottom">
                {({ show: _show, popper, style, ...props }) => {
                    return (
                        <Popover
                            id="publishing"
                            style={Object.assign({}, style, { maxWidth: '600px' })}
                            {...props}
                            onMouseEnter={() =>
                                canShowPublicationStatusOverlay() && setShowPublicationStatusOverlay(true)
                            }
                            onMouseLeave={() => setShowPublicationStatusOverlay(false)}
                        >
                            <Popover.Title as="h3">Publication Status</Popover.Title>

                            <Popover.Content>
                                {isPublishing && <span>Awaiting response from subscribers</span>}

                                {publicationStatuses?.length > 0 &&
                                    publicationStatuses.map((status) => (
                                        <div
                                            key={status.target + (status.failedOn || status.publishedOn)}
                                            className={`mb-2 ${status.failedOn ? 'text-danger' : ''}`}
                                        >
                                            {status.failedOn && (
                                                <>
                                                    <strong>Failed to publish to {status.target}</strong>
                                                    <br />
                                                </>
                                            )}

                                            {status.message}

                                            {status.url && (
                                                <>
                                                    <p>
                                                        <a href="">{status.url}</a>
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    ))}
                            </Popover.Content>
                        </Popover>
                    )
                }}
            </Overlay>
        </>
    )
}

export default DocumentStateBadge
