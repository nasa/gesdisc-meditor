import Router from 'next/router'
import { useState, useEffect, ChangeEvent } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Select from 'react-select'
import styles from './search-bar.module.css'
import ModelIcon from '../model-icon'
import { MdSearch } from 'react-icons/md'
import type { Model, ModelWithWorkflow } from '../../models/types'

/**
 * returns an option to be rendered in the Model list
 * @param model
 */
const formatOptionLabel = model => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <ModelIcon name={model.icon.name} color={model.icon.color} />
        <div style={{ marginLeft: 5 }}>{model?.name}</div>
    </div>
)

type SearchBarProps = {
    allModels: Model[]
    model: ModelWithWorkflow
    modelName: string
    onInput?: Function
}

const SearchBar = ({ allModels, model, modelName, onInput }: SearchBarProps) => {
    const [selectedModel, setSelectedModel] = useState(null)
    const [options, setOptions] = useState([])

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
        updateSelectedModelsDropdown(allModels || [])
    }, [allModels])

    /**
     * route to the requested model when a different one is selected
     * @param selectedModel
     */
    function handleModelChange(selectedModel) {
        setSelectedModel(selectedModel)
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
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        onInput(e.target.value)
                    }
                />

                <Button className={styles.button}>
                    <MdSearch />
                </Button>
            </Form>
        </div>
    )
}

export default SearchBar
