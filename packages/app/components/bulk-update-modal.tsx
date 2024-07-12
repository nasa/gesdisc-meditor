import { bulkUpdateDocument } from 'documents/http'
import { useContext, useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { AppContext } from './app-store'
import { JSONPatchOperation } from './json-patch-operation'

type Props = {
    modelName: string
    model: any
    documents: any
    onSubmit: any
}

type FormField = {
    fieldName: string
    op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test'
    path: string
    value: string
}
const BulkUpdateFormModal = (props: any) => {
    const { modelName, model, documents, show, onComplete, onClose, user } = props

    console.log(documents)

    const [fields, setFields] = useState<FormField[]>([
        {
            fieldName: 'operation-item-1',
            op: 'replace',
            path: '',
            value: '',
        },
    ])

    const [schemaProps, setSchemaProps] = useState<string[]>([])

    const [showModal, setShowModal] = useState(show)

    const { setSuccessNotification, setErrorNotification } = useContext(AppContext)

    const addDynamicJSONPatchForm = () => {
        setFields([
            ...fields,
            {
                fieldName: `operation-item-${fields.length + 1}`,
                op: 'replace',
                path: '',
                value: '',
            },
        ])
    }

    const removeDynamicJSONPatchForm = (fieldName: string) => {
        const data = fields.filter(field => field.fieldName !== fieldName)

        setFields(data)
    }

    const extractJSONFormSchemaProperties = (schema: any, prefix: string = '') => {
        let properties: any = []

        for (let key in schema.properties) {
            let property = schema.properties[key]
            let fullPath = prefix ? `${prefix}.${key}` : key

            properties.push(fullPath)

            if (property.type === 'object' && property.properties) {
                properties = properties.concat(
                    extractJSONFormSchemaProperties(property, fullPath)
                )
            }
        }

        return properties
    }

    const updateOperations = (input: FormField) => {
        console.log(input)

        const data = fields.map(field => {
            if (field.fieldName === input.fieldName) {
                return input
            }

            return field
        })

        setFields(data)
    }

    useEffect(() => {
        const schema = JSON.parse(model.schema)

        console.log('schema', schema)
        console.log('model', model)

        let DocumentProperties = extractJSONFormSchemaProperties(schema)

        if (DocumentProperties.includes(model.titleProperty)) {
            DocumentProperties = DocumentProperties.filter(
                property => model.titleProperty !== property
            )
        }

        console.log('list of properties', DocumentProperties)

        setSchemaProps(DocumentProperties)
    }, [])

    const onSubmit = async () => {
        const operation = fields.map(item => {
            const newItem = { ...item }
            delete newItem['fieldName']

            return newItem
        })

        console.log('operation: ', operation)

        try {
            const [error, response] = await bulkUpdateDocument(
                modelName,
                documents,
                operation
            )

            const responseErrors = response.map(item => {
                if (item.status !== 200) {
                    return item.error
                }
            })

            console.log(responseErrors)

            console.log(responseErrors.join('\n'))

            if (error) {
                setErrorNotification(
                    error.message || 'Failed to bulk update documents'
                )
            } else if (responseErrors.length > 0) {
                setErrorNotification(responseErrors.join('\n'))
            } else {
                onComplete()
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Modal show={show} backdrop="static" size="lg" keyboard={false} centered>
            <Modal.Header>
                <Modal.Title>Bulk Update</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-3">
                    Number of bulk items to update: {documents.length}
                </div>
                {fields.map((field, index) => (
                    <JSONPatchOperation
                        key={field.fieldName}
                        properties={schemaProps}
                        remove={removeDynamicJSONPatchForm}
                        field={field}
                        updateOperations={updateOperations}
                        model={model}
                    ></JSONPatchOperation>
                ))}

                <Button onClick={addDynamicJSONPatchForm}>Add Operation</Button>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onSubmit}>Submit</Button>

                <Button
                    onClick={() => {
                        onClose(false)
                    }}
                >
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export { BulkUpdateFormModal }
