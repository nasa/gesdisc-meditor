import gql from 'graphql-tag'
import Badge from 'react-bootstrap/Badge'
import Popover from 'react-bootstrap/Popover'
import Overlay from 'react-bootstrap/Overlay'
import { useLazyQuery } from '@apollo/react-hooks'
import styles from './document-state-badge.module.css'
import { useEffect, useState, useRef } from 'react'
import StateBadge from '../state-badge'
import omitBy from 'lodash.omitby'

const POLL_FOR_PUBLICATIONSTATUS_MILLIS = 2000

const QUERY = gql`
    query getDocument($modelName: String!, $title: String!, $version: String) {
        document(modelName: $modelName, title: $title, version: $version) {
            title
            publicationStatus {
                url
                redirectToUrl
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
    const refreshStatusTimer = useRef(null)

    const [publicationStatus, setPublicationStatus] = useState(null)
    const [showPublicationStatusOverlay, setShowPublicationStatusOverlay] = useState(
        false
    )

    /**
     * a helper variable to avoid seeing a 0 flash by when there are publication statuses to show
     *
     * should only show publication status response if:
     *      - showPublicationStatus prop is set to true
     *      - we have a publicationStatus response from the API
     */
    const canShowPublicationStatus =
        showPublicationStatus && publicationStatus != null

    const [loadDocument, response] = useLazyQuery(QUERY, {
        fetchPolicy: 'network-only',
    })

    // if showing publication status, query for it
    useEffect(() => {
        if (!showPublicationStatus) return

        clearTimeout(refreshStatusTimer.current)

        // load the publication status
        loadDocument({
            variables: { modelName, title: document.title, version },
        })
    }, [showPublicationStatus])

    // on response from the query, set local publication status state
    useEffect(() => {
        // older documents may have an invalid publication status format, filter these out
        const publicationStatus = response?.data?.document?.publicationStatus?.filter(
            status => {
                // filter out unneeded keys (null values and typename)
                let testObj = omitBy(status, value => !value)
                delete testObj.__typename

                return Object.keys(testObj).length > 0
            }
        )

        if (publicationStatus) {
            setPublicationStatus(publicationStatus)
        }
    }, [response])

    // if there are no responses from subscribers yet (empty publicationStatus array)
    // then set a timeout to check again
    useEffect(() => {
        if (publicationStatus && publicationStatus.length <= 0) {
            refreshStatusTimer.current = setTimeout(() => {
                // load the publication status
                loadDocument({
                    variables: { modelName, title: document.title, version },
                })
            }, POLL_FOR_PUBLICATIONSTATUS_MILLIS)
        }

        return () => {
            clearTimeout(refreshStatusTimer.current)
        }
    }, [publicationStatus])

    return (
        <>
            <span
                ref={badgeRef}
                className={`${styles.badge} ${
                    canShowPublicationStatus ? styles.badgeHoverable : ''
                }`}
                onMouseEnter={() =>
                    canShowPublicationStatus && setShowPublicationStatusOverlay(true)
                }
                onMouseLeave={() => setShowPublicationStatusOverlay(false)}
            >
                <StateBadge>
                    {document?.state}

                    {canShowPublicationStatus && (
                        <Badge
                            variant={
                                publicationStatus?.filter(status => status.failedOn)
                                    .length
                                    ? 'danger'
                                    : 'primary'
                            }
                            className={styles.publicationBadge}
                        >
                            {publicationStatus?.length || '0'}
                        </Badge>
                    )}
                </StateBadge>
            </span>

            <Overlay
                target={badgeRef.current}
                show={showPublicationStatusOverlay}
                placement="bottom"
            >
                {({ show: _show, popper, style, ...props }) => {
                    return (
                        <Popover
                            id="publishing"
                            style={Object.assign({}, style, { maxWidth: '600px' })}
                            {...props}
                            onMouseEnter={() =>
                                canShowPublicationStatus &&
                                setShowPublicationStatusOverlay(true)
                            }
                            onMouseLeave={() =>
                                setShowPublicationStatusOverlay(false)
                            }
                        >
                            <Popover.Title as="h3">Publication Status</Popover.Title>

                            <Popover.Content>
                                {publicationStatus && publicationStatus.length <= 0 && (
                                    <div>
                                        <p>
                                            This document has not been published yet.
                                        </p>
                                        <p>
                                            Waiting for a response from subscribers.
                                        </p>
                                    </div>
                                )}

                                {publicationStatus?.length > 0 &&
                                    publicationStatus.map(status => (
                                        <div
                                            key={
                                                status.target +
                                                (status.failedOn ||
                                                    status.publishedOn)
                                            }
                                            className={`mb-2 ${
                                                status.failedOn ? 'text-danger' : ''
                                            }`}
                                        >
                                            {status.failedOn && (
                                                <>
                                                    <strong>
                                                        Failed to publish to{' '}
                                                        {status.target}
                                                    </strong>
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
