import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { Dropdown, DropdownButton, Row } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import ReactDiffViewer from 'react-diff-viewer'
import { adaptDocumentToLegacyDocument } from '../documents/adapters'
import { fetchDocument } from '../documents/http'
import type { LegacyDocumentWithMetadata } from '../documents/types'
import DocumentStateBadge from './document/document-state-badge'
import styles from './json-diff-viewer.module.css'

const JsonDiffViewer = ({
    currentVersion,
    oldVersion,
    documentTitle,
    modelName,
    history,
    onVersionSelected,
}) => {
    const [currentDocument, setCurrentDocument] =
        useState<LegacyDocumentWithMetadata>(null)
    const [oldDocument, setOldDocument] = useState<LegacyDocumentWithMetadata>(null)

    useEffect(() => {
        Promise.all([
            fetchDocument(documentTitle, modelName, currentVersion),
            fetchDocument(documentTitle, modelName, oldVersion),
        ])
            .then(([currentDocumentResponse, oldDocumentResponse]) => {
                const [currentDocumentError, currentDocument] =
                    currentDocumentResponse
                const [oldDocumentError, oldDocument] = oldDocumentResponse

                setCurrentDocument(adaptDocumentToLegacyDocument(currentDocument))
                setOldDocument(adaptDocumentToLegacyDocument(oldDocument))
            })
            .catch(error => console.error(error))
    }, [documentTitle, oldVersion, currentVersion, modelName])

    function determineDisabled(versionOption, index) {
        const currentVersionIndex = history
            .map(item => item.modifiedOn)
            .indexOf(currentVersion)
        if (currentVersion === versionOption || index < currentVersionIndex) {
            return true
        }
        return false
    }

    function determinedDefaultSelected(index) {
        const currentVersionIndex = history
            .map(item => item.modifiedOn)
            .indexOf(currentVersion)
        if (currentVersionIndex + 1 === index) {
            return true
        }
        return false
    }

    const [splitView, setSplitView] = useState(false)

    function changeSplitView() {
        setSplitView(!splitView)
    }

    function handleItemSelect(e) {
        const listOfOptions = document.querySelectorAll(
            'div[aria-labelledby="jsonDiffSelect"] .dropdown-item'
        )
        listOfOptions.forEach(item => {
            item.classList.remove('active')
        })

        e.target.closest('.dropdown-item').classList.add('active')
    }

    function cleanDocument(key, value) {
        if (key === '_id') {
            return undefined
        }

        return value
    }

    return (
        <>
            <h4 className={styles.jsonDiffHeader}>JSON Diff Viewer</h4>
            <div className={styles.jsonToolBar}>
                <Row>
                    <Col>
                        <label className={styles.jsonDropDown}>
                            Select Version:&nbsp;
                            <DropdownButton
                                variant="outline-dark"
                                id="jsonDiffSelect"
                                title={oldVersion}
                                onSelect={onVersionSelected}
                            >
                                {history.map((item, index) => (
                                    <Dropdown.Item
                                        key={item.modifiedOn}
                                        eventKey={item.modifiedOn}
                                        active={determinedDefaultSelected(index)}
                                        disabled={determineDisabled(
                                            item.modifiedOn,
                                            index
                                        )}
                                        onClick={handleItemSelect}
                                    >
                                        <div className={styles.versionItem}>
                                            <div>
                                                <span>{item.modifiedOn}</span>
                                                <span>{item.modifiedBy}</span>
                                            </div>
                                            <div>
                                                <DocumentStateBadge document={item} />
                                            </div>
                                        </div>
                                    </Dropdown.Item>
                                ))}
                            </DropdownButton>
                        </label>
                        <div className={styles.buttonContainer}>
                            <Button
                                variant="outline-dark"
                                active={splitView}
                                onClick={changeSplitView}
                            >
                                Side-by-side diff view
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
            <ReactDiffViewer
                oldValue={`${JSON.stringify(oldDocument, cleanDocument, 4)}`}
                newValue={`${JSON.stringify(currentDocument, cleanDocument, 4)}`}
                splitView={splitView}
                showDiffOnly={false}
            />
        </>
    )
}

JsonDiffViewer.propTypes = {
    currentVersion: PropTypes.string,
    oldVersion: PropTypes.string,
    documentTitle: PropTypes.string,
    modelName: PropTypes.string,
    history: PropTypes.array,
    onVersionSelected: PropTypes.func,
}

export default JsonDiffViewer
