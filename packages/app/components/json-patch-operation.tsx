import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import Form from 'react-bootstrap/Form'
import { BsXCircleFill } from 'react-icons/bs'

type FormField = {
    fieldName: string
    op: string
    path: string
    value: string
}

type Props = {
    field: FormField
    properties: string[]
    remove: any
    updateOperations: any
    model: any
}

// JsonSchemaForm widgets rely heavily on global window, so we'll need to load them in separately
// as the server side doesn't have a window!
const JsonSchemaForm = dynamic(() => import('./jsonschemaform/jsonschemaform'), {
    ssr: false,
})

const JSONPatchOperation = (props: Props) => {
    const { field, properties, remove, updateOperations, model } = props
    const [operation, setOperation] = useState('replace')
    const [path, setPath] = useState('')
    const [pathValue, setPathValue] = useState('')
    const [formData, setFormData] = useState({})

    const schema = JSON.parse(model.schema)

    useEffect(() => {
        updateOperations({
            ...field,
            op: operation,
            path: path,
            value: pathValue,
        })
    }, [operation, path, pathValue])

    // Initial schema template
    const [initialSchema, setInitialSchema] = useState({})

    const handlePropertySelect = (e: any) => {
        const property = e.target.value
        console.log(property)

        const separatedProperty = property.split('.')

        let newSchema = null
        separatedProperty.forEach(item => {
            if (newSchema) {
                newSchema = newSchema.properties[item]
            } else {
                newSchema = schema.properties[item]
            }
        })

        console.log('newSchema: ', newSchema)

        setInitialSchema({
            type: 'object',
            properties: {
                pathValue: newSchema,
            },
            definitions: schema.definitions,
        })

        setFormData({})

        setPath(property)
    }

    return (
        <>
            <Row>
                <Col>
                    <Form.Group>
                        <Form.Label>Operation</Form.Label>
                        <Form.Control
                            as="select"
                            onChange={(e: any) => {
                                setOperation(e.target.value)
                            }}
                        >
                            <option value="replace">replace</option>
                            <option value="remove">delete</option>
                            <option value="add">add</option>
                            <option value="move">move</option>
                            <option value="copy">copy</option>
                            <option value="test">test</option>
                        </Form.Control>
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Group>
                        <Form.Label>List of Properties</Form.Label>
                        <Form.Control as="select" onChange={handlePropertySelect}>
                            {properties.map((property, index) => (
                                <option key={property} value={property}>
                                    {property}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>

                {/* {operation !== 'remove' && (
                    <Col>
                        <Form.Group>
                            <Form.Label>Value</Form.Label>
                            <Form.Control
                                as="input"
                                onBlur={(e: any) => {
                                    setPathValue(e.target.value)
                                }}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                )} */}

                <Col md={2} className="d-flex align-items-center">
                    <Button variant="light" onClick={() => remove(field.fieldName)}>
                        <BsXCircleFill />
                    </Button>
                </Col>
            </Row>
            {path && (
                <Row>
                    <Col>
                        <Form.Group>
                            <JsonSchemaForm
                                schema={initialSchema}
                                formData={formData}
                                layout={model.layout}
                            ></JsonSchemaForm>
                        </Form.Group>
                    </Col>
                </Row>
            )}
        </>
    )
}

export { JSONPatchOperation }
