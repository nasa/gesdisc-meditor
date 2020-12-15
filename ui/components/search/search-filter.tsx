import styles from './search-filter.module.css'
import { useState, useEffect } from 'react'

const SearchFilter = ({ label, field, value = '', filterOptions = [], onChange }) => {
    const [type, setType] = useState(null)
    const [enumOptions, setEnumOptions] = useState(filterOptions)

    useEffect(() => {
        let type = field?.schema?.type || 'Unsupported'

        setType(type)

        if (field?.schema?.enumOptions) {
            setEnumOptions(field.schema.enumOptions)
        }
    }, [field])

    if (!(type == 'boolean' || (type == 'string' && field?.schema?.enumOptions))) {
        return <></>
    }

    return (
        <div className={styles.action}>
            <label>
                {type == 'boolean' && (
                    <>
                        <input type="checkbox" className="form-check-input mr-2" checked={Boolean(value) == true} onChange={(e) => onChange(label, e.target.checked ? 'true' : '')} />
                        {label}
                    </>
                )}

                {type != 'boolean' && (
                    <>
                        {label}:
                        <select
                            className="form-control"
                            value={value}
                            onChange={(e) => onChange(label, e.target.value)}
                        >
                            <option value=""></option>

                            {enumOptions.map((fieldOption) => (
                                <option key={fieldOption} value={fieldOption}>
                                    {fieldOption}
                                </option>
                            ))}
                        </select>
                    </>
                )}
            </label>
        </div>
    )
}

export default SearchFilter
