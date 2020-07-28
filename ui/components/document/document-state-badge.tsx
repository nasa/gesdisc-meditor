import gql from 'graphql-tag'
import Badge from 'react-bootstrap/Badge'
import Popover from 'react-bootstrap/Popover'
import Spinner from 'react-bootstrap/Spinner'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { HoverableOverlayTrigger } from '../hoverable-overlay-trigger'
import { useLazyQuery } from '@apollo/react-hooks'
import styles from './document-state-badge.module.css'
import { useEffect } from 'react'
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

const PublishingPopover = (
    <Popover id="publishing">
        <Popover.Title as="h3">In progress</Popover.Title>
        <Popover.Content>Awaiting response from subscribers</Popover.Content>
    </Popover>
)

const DocumentStateBadge = ({
    document,
    modelName = null, // required if showPublicationStatus is true
    version = null,
    showPublicationStatus = false,
    pollToUpdate = false, // if true and no subscribers have published the document yet (publicationStatus is empty array), will requery every second until there is a response
}) => {
    const [loadDocument, response] = useLazyQuery(QUERY, {
        fetchPolicy: 'network-only',
    })

    const publicationStatus = response?.data?.document?.publicationStatus
    const isPublishing = publicationStatus && !publicationStatus.length

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

    return (
        <StateBadge>
            {document?.state}

            {isPublishing && (
                <OverlayTrigger placement="bottom" overlay={PublishingPopover}>
                    <Spinner animation="border" role="status" size="sm" variant="primary" className={styles.spinner}>
                        <span className="sr-only">Publishing...please wait</span>
                    </Spinner>
                </OverlayTrigger>
            )}

            {publicationStatuses?.length && (
                <HoverableOverlayTrigger placement="bottom" overlay={(
                    <Popover id="publishing" style={{ maxWidth: '600px' }}>
                        <Popover.Title as="h3">Publication Status</Popover.Title>
                        <Popover.Content>
                        {publicationStatuses.map((status) => (
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
                )}>
                    <Badge variant={publicationStatuses?.filter((status) => status.failedOn).length ? 'danger' : 'primary'} className={styles.publicationBadge}>
                        {publicationStatuses.length}
                    </Badge>
                </HoverableOverlayTrigger>
            )}
        </StateBadge>
    )
}

export default DocumentStateBadge
