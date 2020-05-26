import Router from 'next/router'
import { useQuery } from '@apollo/react-hooks'
import { useState, useEffect } from 'react'
import gql from 'graphql-tag'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Select from 'react-select'
import styles from './search-bar.module.css'
import { withApollo } from '../../lib/apollo'
import ModelIcon from '../model-icon'
import { MdSearch } from 'react-icons/md'
import { useInput } from '../../lib/use-input.hook'
import { useDebounce } from '../../lib/use-debounce.hook'

/**
 * queries all models for display in the select dropdown
 */
const ALL_MODELS_QUERY = gql`
    {
        models {
            name
            icon {
                name
                color
            }
        }
    }
`

/**
 * returns an option to be rendered in the Model list
 * @param model
 */
const formatOptionLabel = (model) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <ModelIcon name={model.icon.name} color={model.icon.color} />
        <div style={{ marginLeft: 5 }}>{ model?.name }</div>
    </div>
)

const SearchBar = ({ model, modelName, initialInput = '', onInput }) => {
    const { data } = useQuery(ALL_MODELS_QUERY)

    const { value, bind, reset } = useInput(initialInput)
    const [selectedModel, setSelectedModel] = useState(null)
    const [options, setOptions] = useState([])
    const searchTerm = useDebounce(value, 200)

    /**
     * set models as selectable options in the dropdown and then select the matching model
     * @param models 
     */
    function updateSelectedModelsDropdown(models) {
        if (!models) return
        setOptions(models)
        setSelectedModel(models.find(model => model.name === modelName))
    }

    /**
     * default the dropdown to just the selected model
     */
    useEffect(() => {
        // don't update dropdown if we've already set it up
        if (options.length || !model) return

        updateSelectedModelsDropdown([model])
    }, [model, options])
 
    /**
     * when models are returned from the API, set them in the dropdown
     */
    useEffect(() => {
        updateSelectedModelsDropdown(data?.models || [])
    }, [data])

    /**
     * notify when search changes
     */
    useEffect(() => {
        onInput(searchTerm)
    }, [searchTerm])

    /**
     * route to the requested model when a different one is selected
     * @param selectedModel 
     */
    function handleModelChange(selectedModel) {
        setSelectedModel(selectedModel)
        reset()
        Router.push('/[modelName]', `/${selectedModel.name}`)
    }

    return (
        <div className={styles.container}>
            <Form className={styles.form}>
                <Select
                    instanceId="search-bar-select"
                    value={selectedModel}
                    formatOptionLabel={formatOptionLabel}
                    onChange={handleModelChange}
                    options={options}
                    className="model-select"
                    classNamePrefix="model-select"
                    isSearchable={false}
                    placeholder=""
                />

                <input
                    type="text"
                    name="search"
                    className={`form-control ${styles.input}`}
                    placeholder={`Search ${modelName} for...`}
                    {...bind}
                />

                <Button className={styles.button}>
                    <MdSearch />
                </Button>
            </Form>
        </div>
    )
}

export default withApollo({ ssr: true })(SearchBar)
