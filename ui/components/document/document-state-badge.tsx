import StateBadge from '../state-badge'

const DocumentStateBadge = ({ document }) => {
    return (
        <StateBadge>
            {document?.state}
        </StateBadge>
    )
}

export default DocumentStateBadge
