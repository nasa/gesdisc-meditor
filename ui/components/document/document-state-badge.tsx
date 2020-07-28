import gql from 'graphql-tag'
import Badge from 'react-bootstrap/Badge'
import Popover from 'react-bootstrap/Popover'
import Spinner from 'react-bootstrap/Spinner'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import { HoverableOverlayTrigger, HoverablePopover } from '../hoverable-overlay-trigger'
import { useLazyQuery } from '@apollo/react-hooks'
import styles from './document-state-badge.module.css'
import { useEffect } from 'react'
import StateBadge from '../state-badge'

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

const PublicationStatusPopover = (
    <Popover id="publication-status">
        <Popover.Title as="h3">Popover title</Popover.Title>
        <Popover.Content>Here's some content</Popover.Content>
    </Popover>
)

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

            {publicationStatus?.length && (
                <HoverableOverlayTrigger placement="bottom" overlay={PublicationStatusPopover}>
                    <Badge variant="primary" className={styles.publicationBadge}>
                        {publicationStatus.length}
                    </Badge>
                </HoverableOverlayTrigger>
            )}
        </StateBadge>
    )
}

export default DocumentStateBadge
