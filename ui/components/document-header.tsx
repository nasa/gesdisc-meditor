import styles from './document-header.module.css'
import ModelIcon from './model-icon'

const DocumentHeader = ({ model }) => {
    return (
        <div>
            <div className={styles.title}>
                <ModelIcon name={model?.icon?.name} color={model?.icon?.color} />
                {model?.name}
            </div>

            <div className={styles.description}>
                {model?.description}
            </div>
        </div>
    )
}

export default DocumentHeader
