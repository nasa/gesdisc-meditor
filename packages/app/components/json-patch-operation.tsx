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
    const [validationErrors, setValidationErrors] = useState([])

    const schema = JSON.parse(model.schema)
    // Initial schema template
    const [initialSchema, setInitialSchema] = useState({})

    // Validation function
    const validateAgainstSchema = (data: any, schema: any) => {
        const errors: string[] = [];

        for (const key in schema.properties) {
            const propertySchema = schema.properties[key];
            const value = data[key];

            if (propertySchema.required && value === undefined) {
                errors.push(`${key} is required`);
            }

            if (propertySchema.type && typeof value !== propertySchema.type) {
                errors.push(`${key} should be of type ${propertySchema.type}`);
            }
        }

        return errors;
    };

    useEffect(() => {
        updateOperations({
            ...field,
            op: operation,
            path: path,
            value: pathValue,
        })
    }, [operation, path, pathValue])

    //initialize schema on mount
    useEffect(() => {
        if (properties.length > 0) {
            const defaultproperty = properties[0]
            handlePropertySelect({ target: { value: defaultproperty } })
        }
    }, [properties])

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

    // Handle form data change to update pathValue in the parent
    const handleFormDataChange = (data: any) => {
        if (data && data.formData.pathValue !== pathValue) {
            setPathValue(data.formData.pathValue); 
            const errors = validateAgainstSchema(data.formData, initialSchema);
            setValidationErrors(errors);
        }
    };

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
            {validationErrors.length > 0 && (
                <div className="alert alert-danger">
                        {validationErrors.map((error) => (
                            [error]
                        ))}   
                </div>
            )}
            {path && (
                <Row>
                    <Col>
                        <Form.Group>
                            <JsonSchemaForm
                                schema={initialSchema}
                                formData={formData}
                                layout={model.layout}
                                onChange={handleFormDataChange}
                            ></JsonSchemaForm>
                        </Form.Group>
                    </Col>
                </Row>
            )}
        </>
    )
}

export { JSONPatchOperation }
