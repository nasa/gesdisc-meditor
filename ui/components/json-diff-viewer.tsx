import ReactDiffViewer from 'react-diff-viewer'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styles from './json-diff-viewer.module.css'
import Button from 'react-bootstrap/Button'
import { Container, DropdownButton, Dropdown, Row } from 'react-bootstrap'
import DocumentStateBadge from './document/document-state-badge'

const VERSIONDOCUMENT_QUERY = gql`
    query getDocument($modelName: String!, $title: String!, $version: String) {
        document(modelName: $modelName, title: $title, version: $version) {
            doc
        }
    }
`

const JsonDiffViewer = ({
    currentVersion,
    oldVersion,
    documentTitle,
    modelName,
    history,
    onVersionSelected
}) => {
    const {
        loading: loadingCurrent,
        error: currentError,
        data: currentDocument
    } = useQuery(VERSIONDOCUMENT_QUERY, {
        fetchPolicy: 'no-cache',
        variables: {
            modelName,
            title: documentTitle,
            version: currentVersion
        }
    })
    const { loading: loadingOld, error: oldError, data: oldDocument } = useQuery(
        VERSIONDOCUMENT_QUERY,
        {
            fetchPolicy: 'no-cache',
            variables: {
                modelName,
                title: documentTitle,
                version: oldVersion
            }
        }
    )

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

    function cleanDocument(doc = { _id: null }) {
        let { _id, ...cleanDoc } = doc
        return cleanDoc
    }

    return (
        <>
            <h4>JSON Diff Viewer</h4>
            <div className={styles.jsonToolBar}>
                <Container>
                    <Row>
                        <Col md={4}>
                            <DropdownButton
                                variant="outline-dark"
                                id="jsonDiffSelect"
                                title="Select version"
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
                        </Col>
                        <Col md={{ span: 4, offset: 4 }} className={styles.textAlign}>
                            <Button
                                variant="outline-dark"
                                active={splitView}
                                onClick={changeSplitView}
                            >
                                Side-by-side diff view
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </div>
            <ReactDiffViewer
                oldValue={`${JSON.stringify(
                    cleanDocument(oldDocument?.document?.doc),
                    null,
                    4
                )}`}
                newValue={`${JSON.stringify(
                    cleanDocument(currentDocument?.document?.doc),
                    null,
                    4
                )}`}
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
    onVersionSelected: PropTypes.func
}

export default JsonDiffViewer
