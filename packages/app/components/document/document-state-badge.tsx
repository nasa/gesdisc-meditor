import omitBy from 'lodash.omitby'
import { useEffect, useRef, useState } from 'react'
import Badge from 'react-bootstrap/Badge'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Overlay from 'react-bootstrap/Overlay'
import Popover from 'react-bootstrap/Popover'
import { fetchDocumentPublications } from '../../documents/http'
import { getRandomIntInclusive } from '../../utils/math'
import StateBadge from '../state-badge'
import styles from './document-state-badge.module.css'

const POLL_FOR_PUBLICATIONSTATUS_MILLIS = 3000
const REDIRECT_TO_URL_DELAY_MILLIS = 10000

async function fetchAndCleanDocumentPublications(title: string, modelName: string) {
    const [error, publications] = await fetchDocumentPublications(title, modelName)

    // If there are no publications, show an empty array so the UI can display the "empty" message.
    const publicationStatus = !!error
        ? []
        : publications.filter(publication => {
              // older documents may have an invalid publication status format, so filter out unneeded keys (null values and typename)
              let testObj = omitBy(publication, value => !value)

              delete testObj.__typename

              return Object.keys(testObj).length > 0
          })

    return publicationStatus
}

const DocumentStateBadge = ({
    document,
    modelName = null, // required if showPublicationStatus is true
    version = null,
    showPublicationStatus = false,
}) => {
    const badgeRef = useRef(null)
    const refreshStatusTimer = useRef(null)

    const [publicationStatus, setPublicationStatus] = useState(null)
    const [showPublicationStatusOverlay, setShowPublicationStatusOverlay] =
        useState(false)

    const [redirectToUrl, setRedirectToUrl] = useState(null)
    const redirectToUrlTimer = useRef(null)

    /**
     * a helper variable to avoid seeing a 0 flash by when there are publication statuses to show
     *
     * should only show publication status response if:
     *      - showPublicationStatus prop is set to true
     *      - we have a publicationStatus response from the API
     */
    const canShowPublicationStatus =
        showPublicationStatus && publicationStatus != null

    useEffect(() => {
        if (showPublicationStatus) {
            fetchAndCleanDocumentPublications(document.title, modelName)
                .then(publications => setPublicationStatus(publications))
                .catch(error => console.error(error))
        }
    }, [])

    // if there are no responses from subscribers yet (empty publicationStatus array)
    // then set a timeout to check again
    useEffect(() => {
        if (publicationStatus?.length === 0) {
            refreshStatusTimer.current = setTimeout(() => {
                fetchAndCleanDocumentPublications(document.title, modelName)
                    .then(publications => setPublicationStatus(publications))
                    .catch(error => console.error(error))
            }, getRandomIntInclusive(2000, POLL_FOR_PUBLICATIONSTATUS_MILLIS))
        } else {
            redirectToUrlIfRequired()
        }

        return () => {
            clearTimeout(refreshStatusTimer.current)
        }
    }, [publicationStatus])

    /**
     * if a redirectToUrl is set, this useEffect will start a timer to automatically redirect
     */
    useEffect(() => {
        if (!redirectToUrl) {
            // if url has been cleared, clear any existing timers
            clearTimeout(redirectToUrlTimer.current)
            return
        }

        // set a timer to automatically redirect after the specified delay
        redirectToUrlTimer.current = setTimeout(() => {
            window.location.href = redirectToUrl
        }, REDIRECT_TO_URL_DELAY_MILLIS)

        return () => {
            clearTimeout(redirectToUrlTimer.current)
        }
    }, [redirectToUrl])

    /**
     * looks at each publication status for a url to redirect to
     * if found will start a timer to redirect
     *
     * NOTE: will redirect to the first url it finds
     */
    function redirectToUrlIfRequired() {
        // find publication status requiring redirect
        let publicationStatusWithRedirectUrl = publicationStatus?.find(
            status => status.url && status.redirectToUrl
        )

        // only redirect after a "save" or document state change (ex. "Publish", "Approve", etc.)
        // if the user visits the page directly we won't redirect
        if (
            !publicationStatusWithRedirectUrl ||
            window.location.search.indexOf('reload=true') == -1
        ) {
            return
        }

        // set url to redirect to
        setRedirectToUrl(publicationStatusWithRedirectUrl.url)
    }

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
                    {document?.state ?? document?.['x-meditor'].state}

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
                                {publicationStatus &&
                                    publicationStatus.length <= 0 && (
                                        <div>
                                            <p>
                                                This document has not been published
                                                yet.
                                            </p>
                                            <p>
                                                Waiting for a response from
                                                subscribers.
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
                                                        <a
                                                            href={status.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            {status.url}
                                                        </a>
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

            {redirectToUrl && (
                <Modal show={true} backdrop="static" keyboard={false} centered>
                    <Modal.Header>
                        <Modal.Title>Redirecting</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>
                            The document was updated successfully and you will be
                            automatically redirected to{' '}
                            <a href={redirectToUrl}>{redirectToUrl}</a> in{' '}
                            {REDIRECT_TO_URL_DELAY_MILLIS / 1000} sec.
                        </p>

                        <p>
                            If you&apos;d rather stay in mEditor, you can click
                            &quot;Go Back&quot; below to return to the document.
                        </p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setRedirectToUrl(null)}
                        >
                            Go Back
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}

export default DocumentStateBadge
