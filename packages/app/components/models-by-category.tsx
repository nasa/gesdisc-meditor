import Button from 'react-bootstrap/Button'
import ModelIcon from '../components/model-icon'
import styles from './models-by-category.module.css'
import type { ModelCategory } from '../models/types'
import Link from 'next/link'

type ModelsByCategoryProps = {
    modelCategories: ModelCategory[]
}

const ModelsByCategory = ({ modelCategories }: ModelsByCategoryProps) => {
    return (
        <>
            {modelCategories?.map(category => (
                <div key={category.name} className={styles.category}>
                    <h3>{category.name}</h3>

                    <div className={styles.models}>
                        {category.models
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(model => (
                                <div key={model.name} className={styles.model}>
                                    <Link href={`/${model.name}`}>
                                        <Button
                                            variant="light"
                                            className="dashboard-model"
                                        >
                                            <ModelIcon
                                                name={model?.icon?.name}
                                                color={model?.icon?.color}
                                            />
                                            <span>{model?.name}</span>
                                            <span>
                                                ({model?.['x-meditor']?.count})
                                            </span>
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                    </div>
                </div>
            ))}
        </>
    )
}

export default ModelsByCategory
